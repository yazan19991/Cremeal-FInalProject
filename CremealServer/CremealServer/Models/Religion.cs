namespace CremealServer.Models
{
    /// <summary>
    /// Represents a religion with an ID and a title.
    /// </summary>
    public class Religion
    {
        /// <summary>
        /// Gets or sets the unique identifier for the religion.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the title or name of the religion.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Gets or sets the optional count of occurrences or references to this religion.
        /// This property used to track the number of users associated with this religion or other relevant statistics.
        /// </summary>
        public int? Count { get; set; }
    }
}
