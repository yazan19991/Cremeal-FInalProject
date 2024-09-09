namespace CremealServer.Models.Requests
{
    /// <summary>
    /// Represents a request for logging in with Google authentication.
    /// </summary>
    public class GoogleLoginRequest
    {
        /// <summary>
        /// Gets or sets the Google ID token used for authentication.
        /// </summary>
        /// <value>The Google ID token as a string.</value>
        /// <remarks>
        /// This token is typically obtained from the Google OAuth 2.0 flow.
        /// It is used to authenticate the user and obtain user profile information.
        /// </remarks>
        public string IdToken { get; set; }
    }
}
