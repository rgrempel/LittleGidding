class ScholarsController < ApplicationController
  def create
    @record = Scholar.new(params)
    @record.password = params[:password]
    @record.password_confirmation = params[:password_confirmation]

    @toxml_options = {:only => [:id, :email, :full_name, :institution]}
    
    if @record.save
      @status = 0
    else
      @status = -4
    end
    
    render :template => "shared/smartclient/show"
  end
end
