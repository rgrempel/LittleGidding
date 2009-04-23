class ChapterTitlesController < ApplicationController
  def index
    if params.has_key?(:_startRow)
      # Some basic protection
      @startRow = params[:_startRow].to_i
      @endRow = params[:_endRow].to_i

      # @startRow and @endRow are 0-based, but position() is 1 based
      # So, if the position is greater than @startRow, we want it
      @nodes = @@gospel.xpath("/book/hchapter[position() > #{@startRow} and position() <= #{@endRow + 1}]")
    else
      @startRow = 0
      @nodes = @@gospel.xpath("/book/hchapter")
    end

    @status = 0
    @endRow = @startRow + @nodes.length - 1
    @totalRows = @@gospel.xpath("/book/hchapter").length
  end

  def show
    
  end
end
