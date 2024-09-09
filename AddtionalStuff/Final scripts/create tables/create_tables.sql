use igroup237_prod
go 

-- Drop tables in the reverse order of creation to avoid foreign key conflicts

-- Drop User Transaction table
DROP TABLE IF EXISTS [transaction];

-- Drop User Allergens table
DROP TABLE IF EXISTS user_allergens;

-- Drop Allergens table
DROP TABLE IF EXISTS allergens;

-- Drop Statistics table
DROP TABLE IF EXISTS [statistics];

-- Drop Plans table
DROP TABLE IF EXISTS [plan];

-- Drop Reset Password table
DROP TABLE IF EXISTS reseat_password;

-- Drop Meal History table
DROP TABLE IF EXISTS meal_history;

-- Drop Meal table
DROP TABLE IF EXISTS meal;

-- Drop User table
DROP TABLE IF EXISTS [user];

-- Drop Religion table
DROP TABLE IF EXISTS religion;


/* ------------------------------------------   Create Religion table ---------------------------------------*/
-- we used table insted of makeing list condition in the user table becuase
-- we want to make the system scaleable 
create table [religion]
(
	id int identity(1,1) primary key, 
	[religion_title] varchar(255) not null,
	[count] int default(0) not null
)

-- Inserting religions into the religion table
INSERT INTO [religion] ([religion_title]) VALUES ('Not religious');
INSERT INTO [religion] ([religion_title]) VALUES ('Christianity');
INSERT INTO [religion] ([religion_title]) VALUES ('Islam');
INSERT INTO [religion] ([religion_title]) VALUES ('Jewish')

/* ------------------------------------------   Create User table ---------------------------------------*/


create table [user]
(
	id int identity(1,1)  primary key, 
	[user_name] varchar(255) not null, -- the user need to insert the name
	[user_email] nvarchar(255) not null,
	[verfied_forReset] bit not null default(0), -- verfing the email to use reset sp
	[password] varchar(255) not null, -- have validation in the .net server side 
	-- there are no need for image link the image link is the id of the user and the extintion of the id 
	[religion_id] Int default(1), -- the first one is always a not religon 
	[first_created_time] datetime not null, 
	[last_update_time] datetime not null, 
	[coins] int check([coins] >= 0) not null default(0), 
	foreign key([religion_id]) references [religion](id) 
)

/* ------------------------------------------   Create Meal table ---------------------------------------*/

create table [meal]
(
	id int identity(1,1) primary key,
	[name] nvarchar(255) not null, 
	[imageLink] nvarchar(255) not null, 
	[description] ntext default('Each bite is a delightful symphony of taste sensations.'),
	[cooking_time] int, -- in minutes 
	[difficulty] nvarchar(50) check ([difficulty] in ('Easy','Medium','Hard')),
	[ingredients] nvarchar(255) not null, -- the format is "a,b,c.."
	[instructions] ntext not null
)

/* ------------------------------------------   Create Meal history table ---------------------------------------*/

create table [meal_history]
(
	[user_id] int,
    [meal_id] int,
	[favorit] bit default(0), -- 0-False, 1-True
	foreign key ([user_id]) references [user](id),
	foreign key ([meal_id]) references [meal](id),
	primary key ([user_id],[meal_id])
)

/* ------------------------------------------   Create Reset Password table ---------------------------------------*/
-- the data in this table is stored temproray after using 
-- the code trager delete function fot the record 
create table [reseat_password]
(
	[user_id] int not null primary key, -- the user have jsut one generated code 
	-- not scure to keep it int or to change it to string 
	[auto_generated_code] nvarchar(5) not null,
	[generated_time] datetime not null,
)

/* ------------------------------------------   Create Placns table ---------------------------------------*/
-- just for me to use there are no prosesures for this 
create table [plan]
(
	id int identity(1,1) primary key, 
	[plan_title] nvarchar(255) not null,
	[coins_amount] int not null  check ([coins_amount] > 0), 
	[price] float not null check ([price] > 0)
)

-- Inserting religions into the religion table
INSERT INTO [plan] ([plan_title],[coins_amount],[price]) VALUES ('Basic Deal',200,79);
INSERT INTO [plan] ([plan_title],[coins_amount],[price]) VALUES ('Gold Deal',560, 40);
INSERT INTO [plan] ([plan_title],[coins_amount],[price]) VALUES ('Platinum Deal',1000,150);

/* ------------------------------------------   Create Statistics table ---------------------------------------*/
--statistics table 
-- total number of users 
-- total number of meals 
-- Revenue of the app


CREATE TABLE [statistics]
(
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [statistic_name] NVARCHAR(255) NOT NULL,
    [value] INT NOT NULL default(0)
);

INSERT INTO [statistics] ([statistic_name]) VALUES ('Number of users');
INSERT INTO [statistics] ([statistic_name]) VALUES ('Revenue of the App');
INSERT INTO [statistics] ([statistic_name]) VALUES ('Number of the meals');

/* ------------------------------------------   Create Allergens table ---------------------------------------*/

CREATE TABLE allergens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    label NVARCHAR(255) NOT null,
	[count] int default(0) not null
);

INSERT INTO allergens (label) VALUES
    ('Balsam of Peru'),
    ('Buckwheat'),
    ('Celery'),
    ('Egg'),
    ('Fish'),
    ('Fruit'),
    ('Garlic'),
    ('Oats'),
    ('Maize'),
    ('Milk'),
    ('Mustard'),
    ('Peanut'),
    ('Poultry Meat'),
    ('Red Meat'),
    ('Rice'),
    ('Sesame'),
    ('Shellfish'),
    ('Soy'),
    ('Sulfites'),
    ('Tartrazine'),
    ('Tree nut'),
    ('Wheat');

/* ------------------------------------------   Create User Allergens table ---------------------------------------*/
CREATE TABLE user_allergens (
    [user_id] INT NOT NULL,
    allergen_id INT NOT NULL,
    FOREIGN KEY ([user_id]) REFERENCES [user](id),
    FOREIGN KEY (allergen_id) REFERENCES allergens(id),
    PRIMARY KEY ([user_id], allergen_id)
);

/* ------------------------------------------   Create User Transaction table ---------------------------------------*/
CREATE TABLE [transaction] (
    id INT IDENTITY(1,1) PRIMARY KEY,
    [user_id] INT NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    description TEXT,
    date DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [user](id)
);

/* ------------------------------------------   Additional if i have the premesions to do so ---------------------------------------*/

--This is extra thing that I can add to the sql DataBase but is not optional in this data base becuase 
-- the user that i have have no premesion to do this 

-- make sure you have this in the security and change the password for the role 
-- add this to the server .net configreation dont add the Credentials  
-- creating role for the server side that can just call SP querys 
-- need to create a user id and password and assign this role for it 
-- we have no premisions to craete new user but in such a case we need to do this 
create role dbStoredProceduresOnlyAccess
grant execute to dbStoredProceduresOnlyAccess


