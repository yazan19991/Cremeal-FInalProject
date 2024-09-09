using System.Data.SqlClient;
using System.Data;
using CremealServer.Models.Responses;
using CremealServer.Models.Services;
using CremealServer.Models.Requests;

namespace CremealServer.Models.DAL
{
    public partial class GeneralDBservices
    {
        /// <summary>
        /// Retrieves all transactions from the database and returns them as a list of Transaction objects.
        /// </summary>
        /// <returns>A list of <see cref="Transaction"/> objects representing all transactions in the database. Returns null if an error occurs.</returns>
        /// <remarks>
        /// Uses a stored procedure to get all transactions and reads the results into a list of Transaction objects.
        /// If an error occurs during the retrieval process, it logs the error and returns null.
        /// </remarks>
        public List<Transaction> GetAllTransactions()
        {
            List<Transaction> transactionsList = new List<Transaction>();
            OurLogger logger = OurLogger.Instance;

            using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
            {
                try
                {
                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGetAllTransactions", con, null, true))
                    {
                        using (SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                        {
                            while (dataReader.Read())
                            {
                                var t = new Transaction
                                {
                                    Id = Convert.ToInt32(dataReader["id"]),
                                    UserId = Convert.ToInt32(dataReader["user_id"]),
                                    Amount = Convert.ToInt32(dataReader["amount"]),
                                    Currency = dataReader["currency"].ToString(),
                                    Description = dataReader["description"].ToString(),
                                    Date = Convert.ToDateTime(dataReader["date"])
                                };

                                transactionsList.Add(t);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError("GetAllTransactions: An error occurred while retrieving transactions. - " + ex);
                    return null;
                }
            }

            string additional = transactionsList == null || transactionsList.Count == 0 ? "No transactions in the system." : "";
            logger.LogInfo($"Returned all transactions. {additional}");

            return transactionsList;
        }

        /// <summary>
        /// Inserts a new transaction record into the database for the specified user.
        /// </summary>
        /// <param name="t">The payment request containing details about the transaction.</param>
        /// <param name="userId">The ID of the user making the transaction.</param>
        /// <returns>A string message indicating the result of the transaction insertion.</returns>
        /// <remarks>
        /// Uses a stored procedure to insert the transaction record into the database and logs the outcome.
        /// If an error occurs during the process, it logs the error and returns a generic error message.
        /// </remarks>
        public string InsertTransaction(PaymentRequest t, int userId)
        {
            OurLogger logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                {
                    { "@user_id", userId },
                    { "@amount", t.Amount },
                    { "@currency", t.Currency },
                    { "@description", t.Description }
                };

                    using (var cmd = CreateCommandWithStoredProcedure("spInsertTransaction", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();
                        int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                        logger.LogInfo($"User {userId} made a transaction: {statusMessage}");

                        return statusMessage;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError("InsertTransaction: An error occurred while inserting the transaction. - " + ex.Message);
                return "An error occurred while inserting the transaction.";
            }
        }

    }
}
