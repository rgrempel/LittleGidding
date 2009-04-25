class PagesController < ApplicationController
  before_filter :require_scholar, :only => :show  

  def index
    options = {
      :order => :column_start
    }

    if params.has_key?(:_startRow)
      @startRow = params[:_startRow].to_i
      options[:offset] = params[:_startRow].to_i
      options[:limit] = params[:_endRow].to_i - params[:_startRow].to_i + 1
    else
      @startRow = 0
    end

    @records = Page.find :all, options

    @status = 0
    @totalRows = Page.count
    @endRow = @startRow + @records.length - 1
    @toxml_options = {:methods => [:png_url]}

    render :template => "shared/smartclient/index"
  end

  def show
    @page = Page.find params[:id]

    respond_to do |format|
      format.png do
        type = :png
        type = :jpg if @page.localfile.match(/\.jpg$/)
        send_file @page.localfile, :x_sendfile => true, :disposition => "inline", :type => type
      end
    end
  end
end
