USE [igroup237_prod]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:      Khaled Khalaf
-- Create date: 7/8/24
-- Description: Retrieve all transactions from the db 
-- =============================================
create PROCEDURE [dbo].[spGetAllTransactions] 
    @statusMessage nVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Select all transactions
        SELECT id, [user_id], amount, currency, description, date
        FROM [transaction]
        ORDER BY date DESC;

        -- Set the output parameters
        SET @statusMessage = 'Transactions retrieved successfully.';
        SET @status = 1;
    END TRY
    BEGIN CATCH
        -- Handle any errors that may have occurred
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 0;
    END CATCH
END
