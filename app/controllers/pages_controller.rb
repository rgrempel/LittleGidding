class PagesController < ApplicationController
  before_filter :require_scholar, :only => :show  
  
  def show
    @page = Page.find params[:id]

    respond_to do |format|
      format.png do
        send_file @page.localfile, :x_sendfile => true, :type => :png, :disposition => "inline"
      end
    end
  end
end
