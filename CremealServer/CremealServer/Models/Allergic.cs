namespace CremealServer.Models
{
    public class Allergic
    {
        /// <summary>
        /// Gets or sets the unique identifier for the allergen.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the label or name of the allergen.
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Gets or sets the count associated with the allergen.
        /// </summary>
        public int Count { get; set; }
    }

}
