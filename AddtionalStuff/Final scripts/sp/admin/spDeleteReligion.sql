USE [igroup237_prod]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   10/8/24
-- Description:   Delete a religion if no users are associated with it
-- =============================================

create PROCEDURE [dbo].[spDeleteReligion]
    @religionId INT,
    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    BEGIN TRY
        -- Start a transaction
        BEGIN TRANSACTION;

        -- Check if there are any users with the specified religion
        IF EXISTS (SELECT 1 FROM [user] WHERE [religion_id] = @religionId)
        BEGIN
            -- Prevent deletion if users are associated with this religion
            SET @statusMessage = 'Cannot delete the religion because there are users associated with it.';
            SET @status = 1;
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Delete the religion from the religion table
        DELETE FROM [religion]
        WHERE [id] = @religionId;

        -- Commit the transaction
        COMMIT TRANSACTION;

        -- Set success status and message
        SET @statusMessage = 'Religion deleted successfully.';
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
