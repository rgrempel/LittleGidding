xml.instruct! :xml, :version => '1.0', :encoding => 'UTF-8'

xml.response do
  xml.status @status
  xml << @errors.to_xml({
    :skip_instruct => true,
    :skip_types => true,
    :root => "errors",
    :dasherize => false
  })
end
