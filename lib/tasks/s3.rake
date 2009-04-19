desc "Upload .git to s3"
task :s3git do
  sh "git gc"
  sh "/usr/bin/s3cmd sync --delete-removed .git/ s3://s3.pauldyck.com/LittleGidding.git/"
end
