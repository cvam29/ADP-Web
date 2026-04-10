namespace DieticianAssociation.API.Exceptions
{
    public class CustomExceptions
    {
    }

    public class BusinessException(string message) : Exception(message)
    {
    }

    public class ExternalServiceException(string message) : Exception(message)
    {
    }
}
