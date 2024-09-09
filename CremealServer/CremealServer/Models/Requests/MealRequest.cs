namespace CremealServer.Models.Requests
{
    /// <summary>
    /// Represents a meal request with specific dietary preferences and restrictions.
    /// </summary>
    public class MealRequest
    {
        /// <summary>
        /// Gets or sets the ingredients preferred in the meal.
        /// </summary>
        public string Ingredints { get; set; }

        /// <summary>
        /// Gets or sets the allergens to avoid in the meal.
        /// </summary>
        public string Allerges { get; set; }

        /// <summary>
        /// Gets or sets the religious dietary restrictions.
        /// </summary>
        public string Relligion { get; set; }
    }

}
