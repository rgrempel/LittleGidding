class CommentsController < ApplicationController
  before_filter :require_scholar, :only => :index
  # We handle :create internally, rather than in the before_filter
  
  def index
    options = {
      :order => "created_at DESC",
      :include => :scholar
    }

    if params.has_key?(:_startRow)
      @startRow = params[:_startRow].to_i
      options[:offset] = @startRow
      options[:limit] = params[:_endRow].to_i - @startRow + 1
    else
      @startRow = 0
    end

    if params.has_key?(:figure_id)
      options[:conditions] = {:figure_id => params[:figure_id]}
    end

    @records = Comment.find :all, options

    @status = 0

    [:offset, :limit, :include, :order].each do |option|
      options.delete option
    end
    
    @totalRows = Comment.count options
    @endRow = @startRow + @records.length - 1
    
    @toxml_options = {:methods => [:scholar_full_name]}

    render :template => "shared/smartclient/index"
  end

  def create
    data = params[:request][:data][:comments]
    @record = Comment.new(data)
   
    @scholar = current_scholar
    if @scholar
      @record.scholar_id = @scholar.id
      if @record.save
        @status = 0
        @record.deliver_notification!
      else
        @status = -4
      end
    else
      @status = -4
      @record.errors.add :comment, "You must log in to comment"
    end
    
    @toxml_options = {:methods => [:scholar_full_name]}
    
    render :template => "shared/smartclient/show"
  end

  def destroy
    @record = Comment.find params[:id]
    if @record
      if current_scholar.administrator? || (current_scholar.id == @record.scholar_id)
        @record.destroy
        @status = 0
        render :template => "shared/smartclient/show"
      else
        response = <<-END
          <response>
            <status>-1</status>
            <data>You are not allowed to delete this item</data>
          </response>
        END
        render :xml => response, :status => 403
      end
    else
      response = <<-END
        <response>
          <status>-1</status>
          <data>Item not found</data>
        </response>
      END
      render :xml => response, :status => 404
    end
  end
end
