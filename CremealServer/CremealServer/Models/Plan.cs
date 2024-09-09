namespace CremealServer.Models
{
    /// <summary>
    /// Represents a subscription or service plan.
    /// </summary>
    public class Plan
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public int Coins { get; set; }

        public double Price { get; set; }
    }
}
