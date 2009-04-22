class ScholarSessionsController < ApplicationController
  def new

  end

  def create
    data = params[:request][:data][:scholar_sessions]
    @toxml_options = {:only => [:email, :id, :full_name, :institution]}
 
    if data.has_key?(:perishable_token)
      @record = Scholar.find_using_perishable_token(data[:perishable_token])
      if @record
        if @record.activated_at
          # ... an attempt to reset password ...
        else
          # ... an activation ...
          @record.activated_at = Time.now
          @record.save
          @status = 0
          
          ScholarSession.create(@scholar)
        end
      else
        # ... Could not find the perishable_token
        @record = Scholar.new
        @record.email = data[:email]
        @record.perishable_token = data[:perishable_token]
        @status = -4
        @record.errors.add :perishable_token, "was not found in system ..."
      end
    else
      # It's a normal login attempt
      session = ScholarSession.new data
      if session.save
        @status = 0
        @record = session.attempted_record
      else
        @status = -4
        @record = session
        @toxml_options = {}
      end
    end

    render :template => "shared/smartclient/show"
  end

  def destroy

  end

  def update

  end

  def index

  end
end
