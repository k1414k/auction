class AddSearchIndexesToItems < ActiveRecord::Migration[7.1]
  def up
    enable_extension "pg_trgm"

    execute <<~SQL
      CREATE INDEX IF NOT EXISTS index_items_on_normalized_title_trigram
      ON items
      USING gin (LOWER(normalize(title, NFKC)) gin_trgm_ops)
    SQL

    execute <<~SQL
      CREATE INDEX IF NOT EXISTS index_items_on_normalized_description_trigram
      ON items
      USING gin (LOWER(normalize(description, NFKC)) gin_trgm_ops)
    SQL
  end

  def down
    remove_index :items, name: "index_items_on_normalized_description_trigram", if_exists: true
    remove_index :items, name: "index_items_on_normalized_title_trigram", if_exists: true
  end
end
