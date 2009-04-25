xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @nodes.each do |node|
      xml.record do
        text = if node.name == "hchapter"
          "<strong>#{node["toctitle"]}</strong>"
        else
          node.to_xml
        end
        xml.text text 
      end
    end
  end
end
