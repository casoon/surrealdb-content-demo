-- Reader access: sign-up and sign-in directly against the database
DEFINE FIELD email ON person TYPE option<string>;
DEFINE FIELD pass  ON person TYPE option<string> PERMISSIONS NONE;
DEFINE INDEX person_email ON person FIELDS email UNIQUE;

DEFINE ACCESS reader ON DATABASE TYPE RECORD
    SIGNUP (
        CREATE person SET
            name  = $name,
            role  = "Leser",
            email = $email,
            pass  = crypto::argon2::generate($pass)
    )
    SIGNIN (
        SELECT * FROM person
        WHERE email = $email AND crypto::argon2::compare(pass, $pass)
    )
    DURATION FOR TOKEN 15m, FOR SESSION 12h;

-- Permissions per table. Without PERMISSIONS, signed-in readers see nothing.
ALTER TABLE article PERMISSIONS
    FOR select WHERE published = true OR $auth INSIDE <-wrote<-person
    FOR create, update, delete NONE;

ALTER TABLE person PERMISSIONS
    FOR select FULL
    FOR update WHERE id = $auth
    FOR create, delete NONE;

ALTER TABLE tag        PERMISSIONS FOR select FULL;
ALTER TABLE wrote      PERMISSIONS FOR select FULL;
ALTER TABLE tagged     PERMISSIONS FOR select FULL;
ALTER TABLE related_to PERMISSIONS FOR select FULL;
ALTER TABLE follows    PERMISSIONS FOR select FULL;

-- Comments: everyone may read; only the author may create, update or delete their own edge
ALTER TABLE commented PERMISSIONS
    FOR select FULL
    FOR create, update, delete WHERE in = $auth;
