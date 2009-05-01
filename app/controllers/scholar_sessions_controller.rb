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
          @record.password = data[:password]
          @record.password_confirmation = data[:password_confirmation]
          @status = @record.save ? 0 : -4
        else
          # ... an activation ...
          @record.activated_at = Time.now
          @record.save
          @status = 0
          
          ScholarSession.create(@record)
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
    if current_scholar_session
      @record = current_scholar
      current_scholar_session.destroy
      @status = 0
    else
      @status = -1
      @record = Scholar.new
    end

    render :template => "shared/smartclient/show"
  end

  def update

  end

  # This actually returns a singleton representing who is logged in ...
  def index
    @records = current_scholar ? [current_scholar] : []

    @status = 0
    @startRow = 0
    @endRow = @records.length - 1
    @totalRows = @records.length

    @toxml_options = {:only => [:email, :id, :full_name, :institution]}

    render :template => "shared/smartclient/index"
  end
end
