namespace CremealServer.Models.Requests
{
    /// <summary>
    /// Represents a request containing user credentials.
    /// </summary>
    public class UserRequest
    {
        /// <summary>
        /// Gets or sets the user's email address.
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the user's password.
        /// </summary>
        public string? Password { get; set; }
    }
}
