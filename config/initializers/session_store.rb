# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_LittleGidding_session',
  :secret      => '768496dda210b60cf58414ea237b4cdaa59980155ba7767a6ac58a2e732052497b2d95de1f8ff2a82e505f9366df10ed311dbbf6f90d820224798cc8db5bf7f0'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
