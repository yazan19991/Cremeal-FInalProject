namespace CremealServer.Models
{
    /// <summary>
    /// Represents a statistical information item with an identifier, name, and value.
    /// </summary>
    public class StatisticInfo
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public int Value { get; set; }
    }
}
