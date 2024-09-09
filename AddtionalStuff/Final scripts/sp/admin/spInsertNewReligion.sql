USE [igroup237_prod]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   10/8/24
-- Description:   Insert a new religion into the religion table
-- =============================================

create PROCEDURE [dbo].[spInsertNewReligion]
    @religionTitle NVARCHAR(255),
    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Start a transaction
        BEGIN TRANSACTION;

        -- Insert a new religion into the religion table
        INSERT INTO [religion] ([religion_title])
        VALUES (@religionTitle);

        -- Commit the transaction
        COMMIT TRANSACTION;

        -- Set success status and message
        SET @statusMessage = 'Religion inserted successfully.';
        SET @status = 0;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction if an error occurs
        ROLLBACK TRANSACTION;

        -- Set error status and message
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
