class CommentsController < ApplicationController
  def index
    options = {
      :order => :created_at
    }

    if params.has_key?(:_startRow)
      @startRow = params[:_startRow].to_i
      options[:offset] = @startRow
      options[:limit] = params[:endRow].to_i - @startRow + 1
    else
      @startRow = 0
    end

    @records = Comment.find :all, options

    @status = 0
    @totalRows = Comment.count
    @endRow = @startRow + @records.length - 1
    
    render :template => "shared/smartclient/index"
  end
end
