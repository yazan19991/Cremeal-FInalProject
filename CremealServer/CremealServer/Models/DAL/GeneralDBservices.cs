using System.Data.SqlClient;
using System.Data;


namespace CremealServer.Models.DAL
{
    public partial class GeneralDBservices
    {

        public GeneralDBservices()
        {
            //
            // TODO: Add constructor logic here
            //
        }
        //--------------------------------------------------------------------------------------------------
        // This method creates a connection to the database according to the connectionString name in the web.config 
        //--------------------------------------------------------------------------------------------------
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("DBConnection");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }
        //---------------------------------------------------------------------------------
        // Create the SqlCommand using a stored procedure
        //---------------------------------------------------------------------------------
        private SqlCommand CreateCommandWithStoredProcedure(String spName, SqlConnection con, Dictionary<string, object> paramDic, bool enableStatus = false)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            if (paramDic != null)
                foreach (KeyValuePair<string, object> param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);

                }

            if (enableStatus)
            {
                // Add the output parameter
                SqlParameter statusMeessageParam = new SqlParameter("@statusMessage", SqlDbType.NVarChar, 255);
                SqlParameter statusCodeParam = new SqlParameter("@status", SqlDbType.Bit);
                statusMeessageParam.Direction = ParameterDirection.Output;
                statusCodeParam.Direction = ParameterDirection.Output;
                cmd.Parameters.Add(statusMeessageParam);
                cmd.Parameters.Add(statusCodeParam);
            }
            return cmd;
        }
    }
}
