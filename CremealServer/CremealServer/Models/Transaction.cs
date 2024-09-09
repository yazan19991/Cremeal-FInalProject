using CremealServer.Models.DAL;
using CremealServer.Models.Requests;

namespace CremealServer.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public long Amount { get; set; }
        public string? Currency { get; set; }
        public string? Description { get; set; }
        public DateTime? Date { get; set; }


        /// <summary>
        /// Retrieves all transactions from the database.
        /// </summary>
        /// <returns>A list of <see cref="Transaction"/> objects representing all transactions.</returns>
        public static List<Transaction> GetAll()
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.GetAllTransactions();
        }

        /// <summary>
        /// Inserts a new transaction into the database.
        /// </summary>
        /// <param name="t">The payment request containing transaction details.</param>
        /// <param name="userId">The identifier of the user making the transaction.</param>
        /// <returns>A string message indicating the result of the insertion.</returns>
        public static string Insert(PaymentRequest t, int userId)
        {
            GeneralDBservices dbs = new GeneralDBservices();
            return dbs.InsertTransaction(t,userId);
        }


    }
}
