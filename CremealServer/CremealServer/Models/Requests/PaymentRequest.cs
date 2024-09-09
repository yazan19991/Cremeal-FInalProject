namespace CremealServer.Models.Requests
{
    /// <summary>
    /// Represents a request for processing a payment.
    /// </summary>
    public class PaymentRequest
    {
        /// <summary>
        /// Gets or sets the ID of the plan associated with the payment.
        /// </summary>
        /// <value>The ID of the plan.</value>
        public int PlanId { get; set; }

        /// <summary>
        /// Gets or sets the description of the payment.
        /// </summary>
        /// <value>A brief description of the payment.</value>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the amount to be charged for the payment.
        /// </summary>
        /// <value>The amount in the smallest currency unit (e.g., cents for USD).</value>
        public long Amount { get; set; }

        /// <summary>
        /// Gets or sets the currency code for the payment amount.
        /// </summary>
        /// <value>The currency code in ISO 4217 format (e.g., USD, EUR).</value>
        public string? Currency { get; set; }

        /// <summary>
        /// Gets or sets the email address of the payer.
        /// </summary>
        /// <value>The email address associated with the payment.</value>
        public string? Email { get; set; }

        /// <summary>
        /// Gets or sets the ID of the payment method to be used for the payment.
        /// </summary>
        /// <value>The ID of the payment method.</value>
        public string? PaymentMethodId { get; set; }
    }
}
