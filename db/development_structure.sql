--
-- PostgreSQL database dump
--

SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

--
-- Name: plpgsql; Type: PROCEDURAL LANGUAGE; Schema: -; Owner: -
--

CREATE PROCEDURAL LANGUAGE plpgsql;


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: scholar_sessions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE scholar_sessions (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    data text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: scholars; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE scholars (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    institution character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    crypted_password character varying(255) NOT NULL,
    password_salt character varying(255) NOT NULL,
    activated_at timestamp without time zone,
    persistence_token character varying(255) NOT NULL,
    perishable_token character varying(255) NOT NULL,
    login_count integer DEFAULT 0 NOT NULL,
    failed_login_count integer DEFAULT 0 NOT NULL,
    last_request_at timestamp without time zone,
    current_login_at timestamp without time zone,
    last_login_at timestamp without time zone,
    current_login_ip character varying(255),
    last_login_ip character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: scholar_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE scholar_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


--
-- Name: scholar_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE scholar_sessions_id_seq OWNED BY scholar_sessions.id;


--
-- Name: scholars_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE scholars_id_seq
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


--
-- Name: scholars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE scholars_id_seq OWNED BY scholars.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE scholar_sessions ALTER COLUMN id SET DEFAULT nextval('scholar_sessions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE scholars ALTER COLUMN id SET DEFAULT nextval('scholars_id_seq'::regclass);


--
-- Name: scholar_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY scholar_sessions
    ADD CONSTRAINT scholar_sessions_pkey PRIMARY KEY (id);


--
-- Name: scholars_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY scholars
    ADD CONSTRAINT scholars_pkey PRIMARY KEY (id);


--
-- Name: index_scholar_sessions_on_session_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_scholar_sessions_on_session_id ON scholar_sessions USING btree (session_id);


--
-- Name: index_scholar_sessions_on_updated_at; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_scholar_sessions_on_updated_at ON scholar_sessions USING btree (updated_at);


--
-- Name: index_scholars_on_email; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX index_scholars_on_email ON scholars USING btree (email);


--
-- Name: index_scholars_on_last_request_at; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_scholars_on_last_request_at ON scholars USING btree (last_request_at);


--
-- Name: index_scholars_on_persistence_token; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX index_scholars_on_persistence_token ON scholars USING btree (persistence_token);


--
-- Name: unique_schema_migrations; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX unique_schema_migrations ON schema_migrations USING btree (version);


--
-- PostgreSQL database dump complete
--

INSERT INTO schema_migrations (version) VALUES ('20090419201218');

INSERT INTO schema_migrations (version) VALUES ('20090419204244');