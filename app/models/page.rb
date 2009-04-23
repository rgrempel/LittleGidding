require "aws/s3"
  
class Page < ActiveRecord::Base
  S3_CONFIG_PATH = '/etc/s3.pauldyck.com.yml'
  S3_CONFIG = YAML.load(ERB.new(File.read(S3_CONFIG_PATH)).result)[RAILS_ENV].symbolize_keys

  AWS::S3::Base.establish_connection!(
    :access_key_id     => S3_CONFIG[:access_key_id],
    :secret_access_key => S3_CONFIG[:secret_access_key]
  )

  def self.bucket_name
    S3_CONFIG[:bucket_name]
  end

  def localfile
    File.join Rails.root, "s3", self.filename
  end

  def url
    AWS::S3::S3Object.url_for "LittleGidding/#{self.filename}", self.class.bucket_name
  end
end
