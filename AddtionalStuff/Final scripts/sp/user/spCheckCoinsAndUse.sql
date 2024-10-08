USE [igroup237_prod]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Khaled Khalaf
-- Create date: 26/4/24
-- Description:	verfie that having access to the generater
-- =============================================
create PROCEDURE [dbo].[spCheckCoinsAndUse]
	-- you can use user id or email 
	@userId int = null, 
	@userEmail nvarchar(255) = null,

	@statusMessage nvarchar(255) output ,
	@status bit output
AS
BEGIN
	SET NOCOUNT ON;
	begin try

		declare @correntCoins  int = (select [coins] from [user] where [id] = @userId or [user_email] = @userEmail);
		if(@correntCoins >= 0)
		begin
			update [user]
			set [coins] = @correntCoins - 1
			where [id] = @userId or [user_email] = @userEmail
			set @statusMessage = 'Decrease coins'
			set @status = 0
		end
		else
		begin 
			set @statusMessage = 'Somthing went wrong'
			set @status = 1
		end
		
	end try
	begin catch 
		set @statusMessage = 'Somthing went wrong'
		set @status = 1
	end catch
    
END
