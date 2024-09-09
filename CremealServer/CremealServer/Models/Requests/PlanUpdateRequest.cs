namespace CremealServer.Models.Requests
{
    /// <summary>
    /// Represents a request to update a plan's details.
    /// </summary>
    public class PlanUpdateRequest
    {
        /// <summary>
        /// Gets or sets the unique identifier of the plan to be updated.
        /// </summary>
        /// <value>The unique identifier of the plan.</value>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the title of the plan.
        /// </summary>
        /// <value>The title of the plan.</value>
        public string PlanTitle { get; set; }

        /// <summary>
        /// Gets or sets the amount of coins associated with the plan.
        /// </summary>
        /// <value>The amount of coins for the plan.</value>
        public int CoinsAmount { get; set; }

        /// <summary>
        /// Gets or sets the price of the plan.
        /// </summary>
        /// <value>The price of the plan.</value>
        public double Price { get; set; }
    }
}
