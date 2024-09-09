namespace CremealServer.Models.Responses
{
    /// <summary>
    /// Represents a generic response object that contains data and a response message.
    /// </summary>
    /// <typeparam name="T">The type of data contained in the response.</typeparam>
    public class Response<T>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Response{T}"/> class.
        /// </summary>
        public Response()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Response{T}"/> class with specified data and response message.
        /// </summary>
        /// <param name="data">The data to include in the response.</param>
        /// <param name="rm">The response message to include.</param>
        public Response(T data, ResponseMessage rm)
        {
            Data = data;
            Message = rm;
        }

        /// <summary>
        /// Gets or sets the data contained in the response.
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// Gets or sets the response message containing details about the response status.
        /// </summary>
        public ResponseMessage? Message { get; set; }
    }
}
