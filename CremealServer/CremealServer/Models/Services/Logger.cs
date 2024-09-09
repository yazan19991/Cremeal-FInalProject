namespace CremealServer.Models.Services
{
    using System;
    using System.IO;

    public class OurLogger
    {
        /// <summary>
        /// The singleton instance of the <see cref="OurLogger"/> class.
        /// </summary>
        private static OurLogger instance = null;

        /// <summary>
        /// An object used to synchronize access to the singleton instance of the <see cref="OurLogger"/> class.
        /// </summary>
        private static readonly object padlock = new object();

        /// <summary>
        /// The file path where log entries are saved.
        /// </summary>
        private readonly string logFilePath;

        /// <summary>
        /// Initializes a new instance of the <see cref="OurLogger"/> class with the specified log file path.
        /// </summary>
        /// <param name="logFilePath">The file path where log entries will be saved.</param>
        private OurLogger(string logFilePath)
        {
            this.logFilePath = logFilePath;
        }

        /// <summary>
        /// Gets the singleton instance of the <see cref="OurLogger"/> class.
        /// If the instance does not already exist, it is created with a default log file path of "log.txt".
        /// </summary>
        /// <returns>The singleton instance of the <see cref="OurLogger"/> class.</returns>
        public static OurLogger Instance
        {
            get
            {
                lock (padlock)
                {
                    if (instance == null)
                    {
                        instance = new OurLogger("log.txt");
                    }
                    return instance;
                }
            }
        }

        /// <summary>
        /// Logs an informational message to the log file with an "INFO" level.
        /// </summary>
        /// <param name="message">The message to log as informational.</param>
        public void LogInfo(string message)
        {
            Log("INFO", message);
        }

        /// <summary>
        /// Logs a warning message to the log file with a "WARNING" level.
        /// </summary>
        /// <param name="message">The message to log as a warning.</param>
        public void LogWarning(string message)
        {
            Log("WARNING", message);
        }

        /// <summary>
        /// Logs an error message to the log file with an "ERROR" level.
        /// </summary>
        /// <param name="message">The message to log as an error.</param>
        public void LogError(string message)
        {
            Log("ERROR", message);
        }


        /// <summary>
        /// Logs a message with a specified log level to both the console and a log file.
        /// </summary>
        /// <param name="level">The log level (e.g., "INFO", "WARNING", "ERROR") indicating the severity of the message.</param>
        /// <param name="message">The message to log.</param>
        private void Log(string level, string message)
        {
            string logMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} [{level}] {message}";
            Console.WriteLine(logMessage);

            try
            {
                File.AppendAllText(logFilePath, logMessage + Environment.NewLine); 
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Failed to write to log file: {ex.Message}");
            }
        }

    }

}
