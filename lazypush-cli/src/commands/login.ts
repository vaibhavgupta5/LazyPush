import open from "open";
import inquirer from "inquirer";
import { createServer, Server } from "http";
import { saveSession, getSession } from "../config";
import { info, success, error } from "../logger";

export async function handleLogin() {
  try {
    const existing = getSession();
    if (existing) {
      success(`Already logged in as: ${existing.username}`);
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Login again?",
          default: false,
        },
      ]);
      if (!confirm) return;
    }

    const token = await waitForOAuthCallback();
    
    if (!token) {
      error("Authentication cancelled");
      process.exit(1);
    }

    info("Verifying token...");
    try {
      const jwtPayload = parseJwt(token);
      if (!jwtPayload.userId) {
        throw new Error('Invalid token: missing userId');
      }
      
      const session = {
        token,
        userId: jwtPayload.userId,
        username: jwtPayload.username || "user",
        createdAt: new Date().toISOString(),
      };

      saveSession(session);
      success(`Logged in successfully as ${jwtPayload.username}!`);
      const expiryDate = new Date(jwtPayload.exp * 1000);
      info(`Token will expire on: ${expiryDate.toLocaleString()}`);
    } catch (e: any) {
      error(`Token validation failed: ${e.message}`);
      process.exit(1);
    }
  } catch (e: any) {
    error(`Login failed: ${e.message}`);
    process.exit(1);
  }
}

async function waitForOAuthCallback(): Promise<string | null> {
  return new Promise((resolve) => {
    let server: Server | null = null;
    const port = 3001;
    const timeout = setTimeout(() => {
      if (server) server.close();
      error("Login timeout - no response from GitHub");
      resolve(null);
    }, 10 * 60 * 1000); // 10 minute timeout

    server = createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end("Invalid request");
        return;
      }

      
      const urlObj = new URL(`http://localhost${req.url}`);
      const token = urlObj.searchParams.get("token");
      const errorParam = urlObj.searchParams.get("error");

      if (errorParam) {
        res.writeHead(400);
        res.end(`Authentication failed: ${errorParam}`);
        if (server) server.close();
        clearTimeout(timeout);
        resolve(null);
        return;
      }

      if (token) {
        res.writeHead(200);
        res.end("Authentication successful! You can close this window.");
        if (server) server.close();
        clearTimeout(timeout);
        resolve(token);
        return;
      }

      res.writeHead(400);
      res.end("Missing token");
    });

    server.listen(port, () => {
      info("Opening browser for GitHub authentication...");
      const apiUrl = process.env.LAZYPUSH_API || "https://lazypush.onrender.com";
      const loginUrl = `${apiUrl}/auth/github?redirect_uri=https://lazypush.onrender.com/auth/callback`;

      open(loginUrl);
      info("Browser opened. If it did not open, visit:");
      info(loginUrl);
      info("");
    });
  });
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
  process.exit(1);
}
