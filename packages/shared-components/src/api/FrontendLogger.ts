type LogLevel = "info" | "error";

class FrontendLogger {
  private readonly baseUrl: string;
  private readonly enabled: boolean;

  constructor(baseUrl: string = "", enabled: boolean = false) {
    this.baseUrl = baseUrl;
    this.enabled = enabled;
  }

  info(message: string, metadata?: object) {
    this.log("info", message, metadata);
  }

  error(message: string, metadata?: object) {
    this.log("error", message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: object) {
    if (this.enabled) {
      try {
        fetch(`${this.baseUrl}/api/log/${level}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            message,
            metadata,
          }),
        }).then((response) => {
          if (!response.ok) {
            console.log(`Failed to log ${level}: ${message} (status: ${response.status})`);
          }
        });
      } catch (err) {
        console.log(`Failed to log ${level}: ${message}`, err);
      }
    }
  }
}

export default FrontendLogger;
