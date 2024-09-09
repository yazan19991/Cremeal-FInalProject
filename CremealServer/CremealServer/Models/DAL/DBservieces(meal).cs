using System.Data.SqlClient;
using System.Data;
using CremealServer.Models.Services;

namespace CremealServer.Models.DAL
{
    public partial class GeneralDBservices
    {
        /// <summary>
        /// Inserts a new meal record into the database.
        /// </summary>
        /// <param name="meal">The meal object containing details of the meal to be inserted.</param>
        /// <param name="userId">The ID of the user inserting the meal.</param>
        /// <returns>A status message indicating the result of the operation.</returns>
        /// <exception cref="ArgumentNullException">Thrown when the <paramref name="meal"/> object is null.</exception>
        /// <exception cref="ArgumentException">Thrown when the <paramref name="userId"/> is less than or equal to zero.</exception>
        /// <exception cref="InvalidOperationException">Thrown when there is a database operation failure.</exception>
        /// <exception cref="Exception">Thrown for general errors that occur during the insertion process.</exception>
        public string? InsertMeal(Meal meal, int userId)
        {
            if (meal == null)
            {
                OurLogger.Instance.LogWarning("Meal object is null in InsertMeal.");
                throw new ArgumentNullException(nameof(meal), "Meal object cannot be null.");
            }

            if (userId <= 0)
            {
                OurLogger.Instance.LogWarning($"Invalid user ID in InsertMeal: {userId}");
                throw new ArgumentException("Invalid user ID.");
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME)) 
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId },
                        { "@Name", meal.Name },
                        { "@ImageLink", meal.ImageLink },
                        { "@Description", meal.Description },
                        { "@CookingTime", meal.CookingTime },
                        { "@Difficulty", meal.Difficulty },
                        { "@Ingredients", meal.Ingredients },
                        { "@Instructions", meal.Instructions }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spInsertMeal", con, paramDic, true))
                    {
                        try 
                        { 

                            cmd.ExecuteScalar();

                            string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                            OurLogger.Instance.LogInfo($"Meal inserted successfully. UserId: {userId}, StatusMessage: {statusMessage}");
                            return statusMessage;
                        }
                        catch (SqlException sqlEx)
                        {
                            OurLogger.Instance.LogError($"SQL error in InsertMeal: {sqlEx.Message}");
                            throw new InvalidOperationException("Database operation failed.", sqlEx);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error in InsertMeal: {ex.Message}");
                            throw new Exception("An error occurred while inserting the meal.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in InsertMeal: { ex.Message}");
                throw new Exception($"Error in InsertMeal: { ex.Message}"); 
            }
        }

        /// <summary>
        /// Adds a specified meal to the user's list of favorites.
        /// </summary>
        /// <param name="mealId">The ID of the meal to be added to favorites.</param>
        /// <param name="userId">The ID of the user adding the meal to favorites.</param>
        /// <returns>A status message indicating the result of the operation.</returns>
        /// <exception cref="ArgumentException">Thrown when the <paramref name="userId"/> or <paramref name="mealId"/> is less than or equal to zero.</exception>
        /// <exception cref="InvalidOperationException">Thrown when there is a database operation failure.</exception>
        /// <exception cref="Exception">Thrown for general errors that occur during the addition process.</exception>
        public string? AddToFavorite(int mealId, int userId)
        {
           

            if (userId <= 0)
            {
                OurLogger.Instance.LogWarning($"Invalid user ID in InsertMeal: {userId}");
                throw new ArgumentException("Invalid user ID.");
            }

            if (mealId <= 0)
            {
                OurLogger.Instance.LogWarning($"Invalid meal ID in InsertMeal: {userId}");
                throw new ArgumentException("Invalid meal ID.");
            }
            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@UserId", userId },
                        { "@MealId", mealId },
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spInsertMealToFavorite", con, paramDic, true))
                    {
                        try
                        { 
                            cmd.ExecuteScalar();

                            string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();
                            OurLogger.Instance.LogInfo($"Meal added successfully. UserId: {userId}, StatusMessage: {statusMessage}");
                            return statusMessage;
                        }
                        catch (SqlException sqlEx)
                        {
                            OurLogger.Instance.LogError($"SQL error in AddToFavorite: {sqlEx.Message}");
                            throw new InvalidOperationException("Database operation failed.", sqlEx);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error in AddToFavorite: {ex.Message}");
                            throw new Exception("An error occurred while adding the meal.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in AddToFavorite: { ex.Message}");
                throw new Exception($"Error in AddToFavorite: { ex.Message}");
            }
        }

        /// <summary>
        /// Removes a meal from a user's list of favorites.
        /// </summary>
        /// <param name="mealId">The unique identifier of the meal to be removed from favorites.</param>
        /// <param name="userId">The unique identifier of the user whose favorite list is being updated.</param>
        /// <returns>An anonymous object containing the status message and status code of the operation.</returns>
        /// <exception cref="ArgumentException">Thrown when the provided user ID or meal ID is less than or equal to zero.</exception>
        /// <exception cref="InvalidOperationException">Thrown when a SQL error occurs during the database operation.</exception>
        /// <exception cref="Exception">Thrown for any other errors that occur during the removal process.</exception>
        public object RemoveMealFromFavorite(int mealId, int userId)
        {
            var logger = OurLogger.Instance;

            // Validate inputs
            if (userId <= 0)
            {
                logger.LogWarning($"Invalid user ID provided: {userId}");
                throw new ArgumentException("Invalid user ID.");
            }

            if (mealId <= 0)
            {
                logger.LogWarning($"Invalid meal ID provided: {mealId}");
                throw new ArgumentException("Invalid meal ID.");
            }

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@UserId", userId },
                        { "@MealId", mealId },
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spRemoveMealFromFavorite", con, paramDic, true))
                    {
                        try
                        {
                            cmd.ExecuteScalar();
                            int statusCode = Convert.ToInt32(cmd.Parameters["@status"].Value);
                            string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                            if (statusCode == 1)
                            {
                                // Log the error and throw an exception with the status message
                                logger.LogError($"Failed to remove meal from favorites. UserId: {userId}, MealId: {mealId}, StatusMessage: {statusMessage}");
                                throw new InvalidOperationException(statusMessage);
                            }

                            // Log success
                            logger.LogInfo($"Meal removed successfully. UserId: {userId}, MealId: {mealId}, StatusMessage: {statusMessage}");
                            return new { StatusMessage = statusMessage, StatusCode = statusCode };
                        }
                        catch (SqlException sqlEx)
                        {
                            // Log SQL-specific errors
                            logger.LogError($"SQL error in RemoveMealFromFavorite: {sqlEx.Message}");
                            throw new InvalidOperationException("Database operation failed.", sqlEx);
                        }
                        catch (Exception ex)
                        {
                            // Log general errors
                            logger.LogError($"Error in RemoveMealFromFavorite: {ex.Message}");
                            throw new Exception("An error occurred while removing the meal.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log any errors that occur outside the SQL operation
                logger.LogError($"Error in RemoveMealFromFavorite: {ex.Message}");
                throw new Exception($"Error in RemoveMealFromFavorite: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Retrieves a list of meals associated with a specified user.
        /// </summary>
        /// <param name="userId">The ID of the user for whom to retrieve the meals.</param>
        /// <returns>A list of <see cref="Meal"/> objects associated with the specified user. the meals contains also indecator for the favorite meals</returns>
        /// <exception cref="ArgumentException">Thrown when the <paramref name="userId"/> is less than or equal to zero.</exception>
        /// <exception cref="InvalidOperationException">Thrown when there is a database operation failure.</exception>
        /// <exception cref="Exception">Thrown for general errors that occur during the data retrieval process.</exception>
        public List<Meal> GetMealsForUser(int userId)
        {
            if (userId <= 0)
            {
                OurLogger.Instance.LogWarning($"Invalid user ID in GetMealsForUser: {userId}");
                throw new ArgumentException("Invalid user ID.");
            }

            var mealsHistory = new List<Meal>();

            try
            {
                using (SqlConnection con = connect(Helpers.DATABASE_CONNECTION_NAME)) 
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId }
                    };

                    using (SqlCommand cmd = CreateCommandWithStoredProcedure("spGetAllHistoryForUser", con, paramDic, true))
                    {
                        try
                        {
                            using (SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                            {
                                while (dataReader.Read())
                                {
                                    var meal = new Meal
                                    {
                                        Id = dataReader.GetInt32(dataReader.GetOrdinal("id")),
                                        Name = dataReader.GetString(dataReader.GetOrdinal("name")),
                                        ImageLink = dataReader.GetString(dataReader.GetOrdinal("imageLink")),
                                        Description = dataReader.GetString(dataReader.GetOrdinal("description")),
                                        CookingTime = dataReader.GetInt32(dataReader.GetOrdinal("cooking_time")),
                                        Ingredients = dataReader.GetString(dataReader.GetOrdinal("ingredients")),
                                        Difficulty = dataReader.GetString(dataReader.GetOrdinal("difficulty")),
                                        Instructions = dataReader.GetString(dataReader.GetOrdinal("instructions")),
                                        Favorite = dataReader.GetBoolean(dataReader.GetOrdinal("favorit"))
                                    };

                                    mealsHistory.Add(meal);
                                }
                            }
                        }
                        catch (SqlException sqlEx)
                        {
                            OurLogger.Instance.LogError($"SQL error in GetMealsForUser: {sqlEx.Message}");
                            throw new InvalidOperationException("Database operation failed.", sqlEx);
                        }
                        catch (Exception ex)
                        {
                            OurLogger.Instance.LogError($"Error reading data in GetMealsForUser: {ex.Message}" );
                            throw new Exception("An error occurred while reading the meal data.", ex);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OurLogger.Instance.LogError($"Error in GetMealsForUser: {ex.Message}" );
                throw new Exception($"Error in GetMealsForUser: {ex.Message}");
            }

            return mealsHistory;
        }

    }
}
