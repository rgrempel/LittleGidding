namespace :s3 do
  desc "Upload .git to s3"
  task :git do
    sh "git gc"
    sh "/usr/bin/s3cmd sync --delete-removed .git/ s3://s3.pauldyck.com/LittleGidding.git/"
  end

  desc "Download .git from s3"
  task :gitfroms3 do
    sh "/usr/bin/s3cmd sync --delete-removed s3://s3.pauldyck.com/LittleGidding.git/ .git/"
  end

  namespace :images do
    desc "Get images"
    task :get do
      sh "mkdir -p s3"
      sh "/usr/bin/s3cmd sync --delete-removed s3://s3.pauldyck.com/LittleGidding/ s3/"
    end
  end
end
