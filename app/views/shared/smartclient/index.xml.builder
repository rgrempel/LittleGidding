xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml.totalRows @totalRows
  xml.startRow @startRow
  xml.endRow @endRow
  xml.data do
    @records.each_with_index do |record, index|
      row_proc = Proc.new {|options| options[:builder].tag!("sc_row", @startRow + index)}
      xml << record.to_xml({
        :skip_instruct => true,
        :skip_types => true,
        :root => "record",
        :dasherize => false,
        :procs => [row_proc]
      }.merge(@toxml_options || {}))
    end
  end
end
