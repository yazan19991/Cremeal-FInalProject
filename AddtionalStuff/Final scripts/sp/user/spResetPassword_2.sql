USE [igroup237_prod]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Khaled Khalaf
-- Create date:   24/4/24
-- Description:   Insert the generated code and update if it already exists
-- =============================================
create PROCEDURE [dbo].[spInsertGeneratedCode]
    @userId INT,
    @generatedCode NVARCHAR(5),
    @statusMessage NVARCHAR(255) OUTPUT,
    @status BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM [reseat_password] WHERE [user_id] = @userId)
        BEGIN
            -- Update the existing code
            UPDATE [reseat_password]
            SET [auto_generated_code] = @generatedCode, 
                [generated_time] = GETDATE()
            WHERE [user_id] = @userId;
        END
        ELSE
        BEGIN
            -- Insert a new code
            INSERT INTO [reseat_password]([auto_generated_code], [generated_time], [user_id])
            VALUES (@generatedCode, GETDATE(), @userId);
        END

        SET @statusMessage = 'Code inserted/updated successfully';
        SET @status = 0;
    END TRY
    BEGIN CATCH
        -- Handle errors
        SET @statusMessage = ERROR_MESSAGE();
        SET @status = 1;
    END CATCH
END
GO
