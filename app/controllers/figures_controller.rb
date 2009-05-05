class FiguresController < ApplicationController
  def index
    @conditions = []
    @position = []

    if params.has_key?(:_startRow)
      # Some basic protection
      @startRow = params[:_startRow].to_i
      @endRow = params[:_endRow].to_i
    else
      @startRow = 0
    end

    if params.has_key?(:id)
      @conditions << "@id='#{params[:id]}'"
    end

    xpath = "//figure"
    xpath += "[#{@conditions.join(" and ")}]" unless @conditions.empty?
    logger.info xpath
    @nodes = @@gospel.xpath(xpath)
    @totalRows = @nodes.length

    @nodes = @nodes.to_ary[@startRow..@endRow] if params.has_key?(:_startRow)

    # We pick out attributes to return based on dataSource
    # "figures" is full attributes
    # "figures_summary" is just row, id, and column
    @dataSource = params[:_dataSource]

    @status = 0
    @endRow = @startRow + @nodes.length - 1
  end
end
