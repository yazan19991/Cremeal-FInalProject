namespace CremealServer.Models
{
    /// <summary>
    /// Represents a data transfer object for a client, containing essential client information.
    /// </summary>
    public class ClientDTO
    {
        /// <summary>
        /// Gets or sets the unique identifier for the client.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the client.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the email address of the client.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the details of any allergies the client may have.
        /// </summary>
        public string AllergicTo { get; set; }

        /// <summary>
        /// Gets or sets the religion of the client as a string description.
        /// </summary>
        public string Religion { get; set; }


        /// <summary>
        /// Gets or sets the number of coins the client has.
        /// </summary>
        public int Coins { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the client was created.
        /// </summary>
        public DateTime Created { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the client's information was last updated.
        /// </summary>
        public DateTime Updated { get; set; }

        /// <summary>
        /// Gets or sets the JSON Web Token (JWT) assigned to the client for authentication.
        /// </summary>
        public string JWTToken { get; set; }
    }
}
