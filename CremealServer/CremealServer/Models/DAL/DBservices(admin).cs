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
        /// Retrieves a list of all users from the database.
        /// </summary>
        /// <returns>A <see cref="Response{List{ClientDTO}}"/> containing a list of users and a response message with status and details.</returns>
        /// <exception cref="InvalidOperationException">Thrown when there is a failure in the database operation.</exception>
        /// <exception cref="Exception">Thrown for general errors during the retrieval process.</exception>
        public Response<List<ClientDTO>> GetAllUsersInfo()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllUsresInfo", con, null, true))
                {
                    List<ClientDTO> clientsList = new List<ClientDTO>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var client = new ClientDTO
                            {
                                Id = Convert.ToInt32(dataReader["id"]),
                                Name = dataReader["user_name"].ToString(),
                                Email = dataReader["user_email"].ToString(),
                                AllergicTo = dataReader["allergic_to"].ToString(),
                                Religion = dataReader["religion_title"].ToString(),
                                Coins = Convert.ToInt32(dataReader["coins"]),
                                Created = Convert.ToDateTime(dataReader["first_created_time"]),
                                Updated = Convert.ToDateTime(dataReader["last_update_time"])
                            };

                            clientsList.Add(client);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    logger.LogInfo($"Successfully retrieved all users info. Status: {status}, Message: {statusMessage}");

                    return new Response<List<ClientDTO>>(clientsList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllUsersInfo: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in GetAllUsersInfo: {ex.Message}");
                throw new Exception("An error occurred while retrieving user information.", ex);
            }
        }



        /// <summary>
        /// Retrieves a list of all statistics information from the database.
        /// </summary>
        /// <returns>A <see cref="Response{List{StatisticInfo}}"/> containing a list of statistics and a response message with status and details.</returns>
        /// <exception cref="InvalidOperationException">Thrown when there is a failure in the database operation.</exception>
        /// <exception cref="Exception">Thrown for general errors during the retrieval process.</exception>
        public Response<List<StatisticInfo>> GetStatisticsInfo()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllStatistics", con, null, true))
                {
                    List<StatisticInfo> statisticsList = new List<StatisticInfo>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var stat = new StatisticInfo
                            {
                                Id = Convert.ToInt32(dataReader["id"]),
                                Name = dataReader["statistic_name"].ToString(),
                                Value = Convert.ToInt32(dataReader["value"])
                            };

                            statisticsList.Add(stat);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    logger.LogInfo($"Successfully retrieved statistics info. Status: {status}, Message: {statusMessage}");

                    return new Response<List<StatisticInfo>>(statisticsList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetStatisticsInfo: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in GetStatisticsInfo: {ex.Message}");
                throw new Exception("An error occurred while retrieving statistics information.", ex);
            }
        }



        /// <summary>
        /// Retrieves a list of all available meals from the database.
        /// </summary>
        /// <returns>A <see cref="Response{List{Meal}}"/> containing a list of all meals and a response message with status and details.</returns>
        /// <exception cref="InvalidOperationException">Thrown when there is a failure in the database operation.</exception>
        /// <exception cref="Exception">Thrown for general errors during the retrieval process.</exception>
        public Response<List<Meal>> GetAllMeals()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllMealsInfo", con, null, true))
                {
                    List<Meal> mealsList = new List<Meal>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var m = new Meal
                            {
                                Id = dataReader.GetInt32("id"),
                                Name = dataReader.GetString("name"),
                                ImageLink = dataReader.GetString("imageLink"),
                                Description = dataReader.GetString("description"),
                                CookingTime = dataReader.GetInt32("cooking_time"),
                                Ingredients = dataReader.GetString("ingredients"),
                                Difficulty = dataReader.GetString("difficulty"),
                                Instructions = dataReader.GetString("instructions")
                            };

                            mealsList.Add(m);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    logger.LogInfo($"Successfully retrieved all meals. Status: {status}, Message: {statusMessage}");

                    return new Response<List<Meal>>(mealsList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllMeals: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in GetAllMeals: {ex.Message}");
                throw new Exception("An error occurred while retrieving all meals.", ex);
            }
        }




        /// <summary>
        /// Retrieves a list of all available plans from the database.
        /// </summary>
        /// <returns>A <see cref="Response{List{Plan}}"/> containing a list of all plans and a response message with status and details.</returns>
        /// <exception cref="InvalidOperationException">Thrown when there is a failure in the database operation.</exception>
        /// <exception cref="Exception">Thrown for general errors during the retrieval process.</exception>
        public Response<List<Plan>> GetAllPlans()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllPlansInfo", con, null, true))
                {
                    List<Plan> plansList = new List<Plan>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var p = new Plan
                            {
                                Id = dataReader.GetInt32("id"),
                                Name = dataReader.GetString("plan_title"),
                                Coins = Convert.ToInt32(dataReader["coins_amount"]),
                                Price = Convert.ToDouble(dataReader["price"])
                            };

                            plansList.Add(p);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    // Log success
                    logger.LogInfo($"Successfully retrieved all plans. Status: {status}, Message: {statusMessage}");

                    return new Response<List<Plan>>(plansList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                // Log SQL-specific errors
                logger.LogError($"SQL error in GetAllPlans: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                // Log general errors
                logger.LogError($"Error in GetAllPlans: {ex.Message}");
                throw new Exception("An error occurred while retrieving all plans.", ex);
            }
        }


        /// <summary>
        /// Retrieves a list of all religions from the database.
        /// </summary>
        /// <returns>
        /// A <see cref="Response{T}"/> object containing a list of <see cref="Religion"/> objects and a response message.
        /// </returns>
        /// <response code="200">Returns a list of religions with their details if the retrieval is successful.</response>
        /// <response code="500">Returns a server error message if an internal server error occurs during the retrieval process.</response>
        public Response<List<Religion>> GetAllReligions()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllReligionsInfo", con, null, true))
                {
                    List<Religion> religionsList = new List<Religion>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var r = new Religion
                            {
                                Id = dataReader.GetInt32("id"),
                                Title = dataReader.GetString("religion_title"),
                                Count = dataReader.GetInt32("count"),
                            };

                            religionsList.Add(r);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    logger.LogInfo($"Successfully retrieved all religions. Status: {status}, Message: {statusMessage}");

                    return new Response<List<Religion>>(religionsList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllReligions: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in GetAllReligions: {ex.Message}");
                throw new Exception("An error occurred while retrieving all religions.", ex);
            }
        }

        /// <summary>
        /// Retrieves a list of all allergics from the database.
        /// </summary>
        /// <returns>
        /// A <see cref="Response{List{Allergic}}"/> object containing a list of <see cref="Allergic"/> objects 
        /// and a <see cref="ResponseMessage"/> indicating the status and message of the operation.
        /// </returns>
        /// <exception cref="InvalidOperationException">Thrown when a database operation fails.</exception>
        /// <exception cref="Exception">Thrown when an unexpected error occurs while retrieving the allergics.</exception>
        public Response<List<Allergic>> GetAllAllergics()
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                using (var cmd = CreateCommandWithStoredProcedure("spGetAllAllergicsInfo", con, null, true))
                {
                    List<Allergic> allergicsList = new List<Allergic>();

                    using (var dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                    {
                        while (dataReader.Read())
                        {
                            var a = new Allergic
                            {
                                Id = dataReader.GetInt32("id"),
                                Label = dataReader.GetString("label"),
                                Count = dataReader.GetInt32("count")
                            };

                            allergicsList.Add(a);
                        }
                    }

                    int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                    string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                    logger.LogInfo($"Successfully retrieved all allergics. Status: {status}, Message: {statusMessage}");

                    return new Response<List<Allergic>>(allergicsList, new ResponseMessage(status, statusMessage));
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in GetAllAllergics: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in GetAllAllergics: {ex.Message}");
                throw new Exception("An error occurred while retrieving all allergics.", ex);
            }
        }


        /// <summary>
        /// Updates the details of a plan based on the provided request.
        /// </summary>
        /// <param name="request">The request containing the details of the plan to be updated.</param>
        /// <returns>A <see cref="Response{T}"/> containing the result of the update operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when an error occurs during the update operation.</exception>
        /// <exception cref="Exception">Thrown for general errors during the update operation.</exception>
        public Response<object> UpdatePlan(PlanUpdateRequest request)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@id", request.Id },
                        { "@plan_title", request.PlanTitle },
                        { "@coins_amount", request.CoinsAmount },
                        { "@price", request.Price },

                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spUpdatePlan", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) // Assuming status code 1 indicates an error
                        {
                            logger.LogWarning($"UpdatePlan failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully updated plan. ID: {request.Id}, Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in UpdatePlan: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in UpdatePlan: {ex.Message}");
                throw new Exception("An error occurred while updating the plan.", ex);
            }
        }


        /// <summary>
        /// Deletes a user based on the provided user ID.
        /// </summary>
        /// <param name="userId">The ID of the user to be deleted.</param>
        /// <returns>A <see cref="Response{T}"/> indicating the result of the delete operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the delete operation fails due to a specific error status.</exception>
        /// <exception cref="Exception">Thrown for general errors during the delete operation.</exception>
        public Response<object> DeleteUser(int userId)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@userId", userId },
               
                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spDeleteUser", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) // Assuming status code 1 indicates an error
                        {
                            logger.LogWarning($"DeleteUser failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully deleted user. UserId: {userId}, Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in DeleteUser: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in DeleteUser: {ex.Message}");
                throw new Exception("An error occurred while deleting the user.", ex);
            }
        }

        /// <summary>
        /// Deletes a religion based on the provided religion ID.
        /// </summary>
        /// <param name="religionId">The ID of the religion to be deleted.</param>
        /// <returns>A <see cref="Response{T}"/> indicating the result of the delete operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the delete operation fails due to a specific error status.</exception>
        /// <exception cref="Exception">Thrown for general errors during the delete operation.</exception>
        public Response<object> DeleteReligion(int religionId)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@religionId",religionId },
             
                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spDeleteReligion", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) // Assuming status code 1 indicates an error
                        {
                            logger.LogWarning($"DeleteReligion failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully deleted religion. ReligionId: {religionId}, Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in DeleteReligion: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in DeleteReligion: {ex.Message}");
                throw new Exception("An error occurred while deleting the religion.", ex);
            }
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //public Response<Object> DeleteMeal(int id)
        //{
        //    SqlConnection con = null;
        //    SqlCommand cmd;

        //    try
        //    {
        //        con = connect("DBConnection");

        //        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        //        paramDic.Add("@id", id);

        //        cmd = CreateCommandWithStoredProcedure("spDeleteMeal", con, paramDic, true);
        //        cmd.ExecuteScalar();

        //        int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
        //        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

        //        return new Response<Object>(null, new ResponseMessage(status, statusMessage)); ;
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log exception (implement a logging mechanism here)
        //        throw;
        //    }
        //    finally
        //    {
        //        con?.Close();
        //    }
        //}
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        /// <summary>
        /// Updates the number of coins for a specific user in the database.
        /// </summary>
        /// <param name="id">The ID of the user whose coins are to be updated.</param>
        /// <param name="coins">The new number of coins to set for the user.</param>
        /// <returns>A <see cref="Response{object}"/> indicating the result of the operation, including status and message details.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the database operation fails or returns an error status.</exception>
        /// <exception cref="Exception">Thrown for general errors during the update process.</exception>
        public Response<object> UpdateUserCoins(int id, int coins)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect(Helpers.DATABASE_CONNECTION_NAME))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@id", id },
                        { "@coins", coins }
                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spUpdateUserCoins", con, paramDic, true))
                    {
                        cmd.ExecuteScalar();

                        int status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        string statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) // Assuming status code 1 indicates an error
                        {
                            logger.LogWarning($"UpdateUserCoins failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully updated user coins. ID: {id}, Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in UpdateUserCoins: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in UpdateUserCoins: {ex.Message}");
                throw new Exception("An error occurred while updating user coins.", ex);
            }
        }


        /// <summary>
        /// Deletes an allergen from the database by its ID.
        /// </summary>
        /// <param name="allergenId">The ID of the allergen to be deleted.</param>
        /// <returns>A <see cref="Response{T}"/> object indicating the result of the operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the deletion fails with a status code indicating an error.</exception>
        /// <exception cref="Exception">Thrown for any general errors that occur during the deletion process.</exception>
        public Response<object> DeleteAllergen(int allergenId)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@allergenId", allergenId },

                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spDeleteAllergen", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) // Assuming status code 1 indicates an error
                        {
                            logger.LogWarning($"DeleteAllergen failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully deleted allergen. AllergenId: {allergenId}, Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in DeleteAllergen: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in DeleteAllergen: {ex.Message}");
                throw new Exception("An error occurred while deleting the allergen.", ex);
            }
        }

        /// <summary>
        /// Inserts a new allergen into the database.
        /// </summary>
        /// <param name="allergenLabel">The label of the allergen to be inserted.</param>
        /// <returns>A <see cref="Response{T}"/> object indicating the result of the operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the insertion fails with a status code indicating an error.</exception>
        /// <exception cref="Exception">Thrown for any general errors that occur during the insertion process.</exception>
        public Response<object> InsertNewAllergen(string allergenLabel)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@allergenLabel", allergenLabel },

                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spInsertNewAllergen", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) 
                        {
                            logger.LogWarning($"InsertNewAllergen failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully inserted new allergen. Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in InsertNewAllergen: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in InsertNewAllergen: {ex.Message}");
                throw new Exception("An error occurred while inserting the new allergen.", ex);
            }
        }


        /// <summary>
        /// Inserts a new religion into the database.
        /// </summary>
        /// <param name="religionTitle">The title of the religion to be inserted.</param>
        /// <returns>A <see cref="Response{T}"/> object indicating the result of the operation.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the insertion fails with a status code indicating an error.</exception>
        /// <exception cref="Exception">Thrown for any general errors that occur during the insertion process.</exception>
        public Response<object> InsertNewReligion(string religionTitle)
        {
            var logger = OurLogger.Instance;

            try
            {
                using (var con = connect("DBConnection"))
                {
                    var paramDic = new Dictionary<string, object>
                    {
                        { "@religionTitle", religionTitle },

                    };

                    using (var cmd = CreateCommandWithStoredProcedure("spInsertNewReligion", con, paramDic, true))
                    {
                        cmd.ExecuteNonQuery();

                        var status = Convert.ToInt32(cmd.Parameters["@status"].Value);
                        var statusMessage = cmd.Parameters["@statusMessage"].Value.ToString();

                        if (status == 1) 
                        {
                            logger.LogWarning($"InsertNewReligion failed. StatusMessage: {statusMessage}");
                            throw new InvalidOperationException(statusMessage);
                        }

                        logger.LogInfo($"Successfully inserted new religion. Status: {status}, Message: {statusMessage}");

                        return new Response<object>(null, new ResponseMessage(status, statusMessage));
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                logger.LogError($"SQL error in InsertNewReligion: {sqlEx.Message}");
                throw new InvalidOperationException("Database operation failed.", sqlEx);
            }
            catch (Exception ex)
            {
                logger.LogError($"Error in InsertNewReligion: {ex.Message}");
                throw new Exception("An error occurred while inserting the new religion.", ex);
            }
        }


    }
}
