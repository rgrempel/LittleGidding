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

  def update
    @dataSource = params[:_dataSource]
    @errors = {}
    data = params[:request][:data][:figures]

    @scholar = current_scholar
    if @scholar
      write_gospel do |gospel|
        xpath = "//figure[@id='#{data[:id]}']"
        @node = gospel.xpath(xpath)[0]
        if @node
          [:fp, :size, :composite].each do |attr|
            if data[attr].blank?
              @node.remove_attribute(attr.to_s) if @node.has_attribute?(attr.to_s)
            else
              @node[attr.to_s] = data[attr]
            end
          end
          
          [:figDesc, :head, :text, :ms, :source, :artist, :inven, :sculp, :fe, :date, :n].each do |element|
            subNode = @node.xpath("./#{element.to_s}")[0]
            if data[element].blank?
              subNode.remove if subNode
            else
              unless subNode
                subNode = Nokogiri::XML::Node.new(element.to_s, @node.document())
                @node.add_child subNode
              end
              subNode.content = data[element]
            end
          end

          @status = 0
          true
        else
          @status = -4
          false
        end
      end
    else
      @status = -4
      @errors[:body] = "You must log in to edit"
    end
  end
end
