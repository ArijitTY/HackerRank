"""
Generate 500 unique Python Requests library questions and write to CSV.

Distribution:
  Types:       mcq=200, output=100, scenario=100, code_completion=100
  Difficulty:  Easy~30%, Medium~40%, Hard~30%

Topics: GET/POST/PUT/DELETE/PATCH, Headers, Query Params, Request Body,
        Response Handling, Authentication, Session, Timeout, Retry, SSL,
        Streaming, File Upload, Cookies, Redirects, Error Handling,
        Mock Testing with responses library
"""

import csv
import pandas as pd

TOPICS = [
    "GET Requests",
    "POST Requests",
    "PUT Requests",
    "DELETE Requests",
    "PATCH Requests",
    "Headers",
    "Query Parameters",
    "Request Body",
    "Response Handling",
    "Authentication - Basic",
    "Authentication - Bearer Token",
    "Authentication - OAuth",
    "Session Management",
    "Timeout Handling",
    "Retry Mechanism",
    "SSL Verification",
    "Streaming Responses",
    "File Upload",
    "Cookies",
    "Redirects",
    "Error Handling",
    "Mock Testing with responses",
]


def _q(id, topic, difficulty, qtype, question, a, b, c, d, correct, explanation, code_snippet=""):
    return {
        "id": id,
        "subject": "Python Requests",
        "topic": topic,
        "difficulty": difficulty,
        "type": qtype,
        "question": question,
        "option_a": a,
        "option_b": b,
        "option_c": c,
        "option_d": d,
        "correct_answer": correct,
        "explanation": explanation,
        "code_snippet": code_snippet,
    }


def generate_questions():
    questions = []
    qid = 0

    # ===================================================================
    # MCQ questions (200) -- code_snippet is empty string
    # ===================================================================

    # --- GET Requests (MCQ) ---
    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "Which function in the requests library is used to send an HTTP GET request?",
        "requests.get()", "requests.send()", "requests.fetch()", "requests.retrieve()",
        "A", "requests.get() sends an HTTP GET request to the specified URL."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "What does requests.get(url) return?",
        "A Response object", "A string of HTML", "A dictionary", "A file object",
        "A", "requests.get() returns a Response object containing the server's response."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "Which attribute of a Response object contains the status code?",
        "response.status_code", "response.code", "response.status", "response.http_code",
        "A", "The status_code attribute holds the HTTP status code (e.g. 200, 404)."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Medium", "mcq",
        "What is the default HTTP method when using requests.request('GET', url)?",
        "GET", "POST", "HEAD", "OPTIONS",
        "A", "The first argument to requests.request() specifies the HTTP method."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Medium", "mcq",
        "Which parameter of requests.get() is used to pass URL query parameters?",
        "params", "query", "args", "data",
        "A", "The params keyword argument accepts a dict of query parameters appended to the URL."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Hard", "mcq",
        "When requests.get() follows redirects, which attribute holds the history of intermediate responses?",
        "response.history", "response.redirects", "response.chain", "response.previous",
        "A", "response.history is a list of Response objects for redirects that were followed."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Hard", "mcq",
        "What happens if you call response.json() on a response that is not valid JSON?",
        "Raises requests.exceptions.JSONDecodeError", "Returns None", "Returns an empty dict", "Raises ValueError only in Python 2",
        "A", "response.json() raises a JSONDecodeError (subclass of ValueError) if the body is not valid JSON."))

    # --- POST Requests (MCQ) ---
    qid += 1
    questions.append(_q(qid, "POST Requests", "Easy", "mcq",
        "Which function sends an HTTP POST request in the requests library?",
        "requests.post()", "requests.send_post()", "requests.push()", "requests.submit()",
        "A", "requests.post() is the convenience function for POST requests."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Easy", "mcq",
        "What parameter is used to send form-encoded data in a POST request?",
        "data", "body", "form", "payload",
        "A", "The data parameter sends form-encoded data (application/x-www-form-urlencoded)."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Medium", "mcq",
        "What parameter sends JSON data in requests.post()?",
        "json", "data", "body", "payload",
        "A", "The json parameter serialises the dict to JSON and sets Content-Type to application/json."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Medium", "mcq",
        "What Content-Type header is automatically set when using the json parameter?",
        "application/json", "text/json", "application/x-www-form-urlencoded", "multipart/form-data",
        "A", "When using json=, requests automatically sets Content-Type: application/json."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Hard", "mcq",
        "If both data and json parameters are provided to requests.post(), which takes precedence?",
        "data is ignored and json is used", "data takes precedence", "A TypeError is raised", "Both are sent",
        "A", "When json is provided, it overrides data and the body is serialised from the json parameter."))

    # --- PUT Requests (MCQ) ---
    qid += 1
    questions.append(_q(qid, "PUT Requests", "Easy", "mcq",
        "Which function sends an HTTP PUT request?",
        "requests.put()", "requests.update()", "requests.replace()", "requests.modify()",
        "A", "requests.put() sends an HTTP PUT request."))

    qid += 1
    questions.append(_q(qid, "PUT Requests", "Medium", "mcq",
        "In RESTful API design, what does a PUT request typically do?",
        "Replaces the entire resource", "Partially updates a resource", "Deletes a resource", "Creates a new resource only",
        "A", "PUT conventionally replaces the entire resource at the given URL."))

    qid += 1
    questions.append(_q(qid, "PUT Requests", "Hard", "mcq",
        "What is the key semantic difference between PUT and POST in HTTP?",
        "PUT is idempotent while POST is not", "POST is idempotent while PUT is not", "PUT cannot have a body", "There is no difference",
        "A", "PUT is idempotent: sending the same request multiple times produces the same result."))

    # --- DELETE Requests (MCQ) ---
    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Easy", "mcq",
        "Which function sends an HTTP DELETE request?",
        "requests.delete()", "requests.remove()", "requests.destroy()", "requests.del()",
        "A", "requests.delete() sends an HTTP DELETE request."))

    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Medium", "mcq",
        "Can a DELETE request include a request body in the requests library?",
        "Yes, using the data or json parameter", "No, DELETE cannot have a body", "Only with a special flag", "Only in HTTP/2",
        "A", "The requests library allows sending a body with DELETE via data or json parameters."))

    # --- PATCH Requests (MCQ) ---
    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Easy", "mcq",
        "Which function sends an HTTP PATCH request?",
        "requests.patch()", "requests.partial_update()", "requests.modify()", "requests.fix()",
        "A", "requests.patch() sends an HTTP PATCH request for partial resource updates."))

    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Medium", "mcq",
        "What is the semantic difference between PATCH and PUT?",
        "PATCH partially updates a resource; PUT replaces it entirely", "They are identical", "PATCH is for creating resources", "PUT is for partial updates",
        "A", "PATCH applies a partial modification whereas PUT replaces the entire resource."))

    # --- Headers (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Headers", "Easy", "mcq",
        "How do you send custom headers with a GET request?",
        "requests.get(url, headers={'Key': 'Value'})", "requests.get(url, head={'Key': 'Value'})", "requests.get(url, header='Key: Value')", "requests.get(url).headers = {'Key': 'Value'}",
        "A", "The headers parameter accepts a dictionary of HTTP headers."))

    qid += 1
    questions.append(_q(qid, "Headers", "Easy", "mcq",
        "How do you access response headers?",
        "response.headers", "response.head", "response.get_headers()", "response.header_dict",
        "A", "response.headers is a case-insensitive dictionary of response headers."))

    qid += 1
    questions.append(_q(qid, "Headers", "Medium", "mcq",
        "Are response header lookups case-sensitive in the requests library?",
        "No, they are case-insensitive", "Yes, they are case-sensitive", "Only for custom headers", "Depends on the server",
        "A", "response.headers uses a CaseInsensitiveDict so lookups are case-insensitive."))

    qid += 1
    questions.append(_q(qid, "Headers", "Hard", "mcq",
        "What class does requests use internally for response headers?",
        "CaseInsensitiveDict", "OrderedDict", "defaultdict", "HeaderDict",
        "A", "requests uses CaseInsensitiveDict from requests.structures for headers."))

    # --- Query Parameters (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Query Parameters", "Easy", "mcq",
        "Which keyword argument adds query parameters to a GET request URL?",
        "params", "query", "qs", "args",
        "A", "The params keyword argument is appended to the URL as query string parameters."))

    qid += 1
    questions.append(_q(qid, "Query Parameters", "Medium", "mcq",
        "What type can be passed to the params parameter?",
        "dict, list of tuples, or bytes", "Only dict", "Only string", "Only list",
        "A", "params accepts a dict, a list of 2-tuples, or a bytes object."))

    qid += 1
    questions.append(_q(qid, "Query Parameters", "Hard", "mcq",
        "If params={'key': ['v1', 'v2']} is passed, how is the URL encoded?",
        "key=v1&key=v2", "key=[v1,v2]", "key=v1+v2", "key=v1;v2",
        "A", "When a list is provided as a value, the key is repeated for each element."))

    # --- Request Body (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Request Body", "Easy", "mcq",
        "What does the data parameter accept in requests.post()?",
        "A dictionary, bytes, or file-like object", "Only JSON strings", "Only bytes", "Only dictionaries",
        "A", "The data parameter is flexible and accepts dicts, bytes, strings, or file-like objects."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Medium", "mcq",
        "What happens when you pass a dict to the data parameter of requests.post()?",
        "It is form-encoded as application/x-www-form-urlencoded", "It is sent as JSON", "It is sent as multipart", "A TypeError is raised",
        "A", "Dicts passed to data are form-encoded automatically."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Hard", "mcq",
        "How can you send raw bytes as the request body?",
        "Pass a bytes object to the data parameter", "Use the raw parameter", "Use the bytes parameter", "Use json=bytes_obj",
        "A", "You can pass bytes directly to data to send raw byte content."))

    # --- Response Handling (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "Which attribute returns the response body as a string?",
        "response.text", "response.body", "response.string", "response.data",
        "A", "response.text returns the response body decoded as a Unicode string."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "Which attribute returns the response body as bytes?",
        "response.content", "response.bytes", "response.raw_data", "response.binary",
        "A", "response.content returns the response body as raw bytes."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Medium", "mcq",
        "What does response.json() do?",
        "Parses the response body as JSON and returns a Python object", "Returns the raw JSON string", "Validates the JSON schema", "Converts the response to a JSON file",
        "A", "response.json() deserialises the JSON response body into a Python dict/list."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Medium", "mcq",
        "Which attribute gives the encoding used to decode response.text?",
        "response.encoding", "response.charset", "response.decode_type", "response.text_encoding",
        "A", "response.encoding is the encoding used; it can also be set manually."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Hard", "mcq",
        "What does response.raise_for_status() do?",
        "Raises an HTTPError for 4xx/5xx status codes", "Returns the status code", "Prints the status", "Logs the status",
        "A", "raise_for_status() raises requests.exceptions.HTTPError if the status code indicates an error."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Hard", "mcq",
        "How can you access the raw socket response from urllib3?",
        "response.raw (with stream=True)", "response.socket", "response.connection", "response.urllib3",
        "A", "Setting stream=True and accessing response.raw gives the urllib3 HTTPResponse object."))

    # --- Authentication - Basic (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Easy", "mcq",
        "How do you send HTTP Basic authentication with requests?",
        "requests.get(url, auth=('user', 'pass'))", "requests.get(url, login=('user', 'pass'))", "requests.get(url, basic_auth=True)", "requests.get(url, credentials=('user', 'pass'))",
        "A", "A tuple of (username, password) passed to auth uses HTTPBasicAuth by default."))

    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Medium", "mcq",
        "What class provides explicit Basic authentication?",
        "requests.auth.HTTPBasicAuth", "requests.BasicAuth", "requests.auth.Basic", "requests.HTTPAuth",
        "A", "HTTPBasicAuth from requests.auth explicitly provides Basic auth."))

    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Hard", "mcq",
        "What encoding does HTTP Basic Auth use for the credentials?",
        "Base64", "SHA-256", "MD5", "URL encoding",
        "A", "Basic Auth encodes username:password in Base64 in the Authorization header."))

    # --- Authentication - Bearer Token (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Authentication - Bearer Token", "Easy", "mcq",
        "How do you send a Bearer token with requests?",
        "headers={'Authorization': 'Bearer TOKEN'}", "auth=('Bearer', 'TOKEN')", "token='TOKEN'", "bearer='TOKEN'",
        "A", "Bearer tokens are sent via the Authorization header with the 'Bearer ' prefix."))

    qid += 1
    questions.append(_q(qid, "Authentication - Bearer Token", "Medium", "mcq",
        "Which header carries the Bearer token?",
        "Authorization", "Authentication", "X-Auth-Token", "Bearer-Token",
        "A", "The standard Authorization header carries Bearer tokens."))

    # --- Authentication - OAuth (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Authentication - OAuth", "Medium", "mcq",
        "Which third-party library integrates OAuth1 with requests?",
        "requests-oauthlib", "oauthlib-requests", "requests-oauth2", "python-oauth",
        "A", "requests-oauthlib provides OAuth1 and OAuth2 integration with the requests library."))

    qid += 1
    questions.append(_q(qid, "Authentication - OAuth", "Hard", "mcq",
        "What class from requests_oauthlib is used for OAuth1 authentication?",
        "OAuth1", "OAuth1Auth", "OAuth1Session", "OAuth1Handler",
        "A", "The OAuth1 class is used as the auth parameter for OAuth1 authentication."))

    # --- Session Management (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Session Management", "Easy", "mcq",
        "How do you create a session object in requests?",
        "requests.Session()", "requests.create_session()", "requests.new_session()", "requests.connect()",
        "A", "requests.Session() creates a session that persists cookies and settings across requests."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Easy", "mcq",
        "What is a key benefit of using a requests Session?",
        "Persists cookies across requests", "Automatically retries failed requests", "Encrypts all data", "Caches all responses",
        "A", "Sessions persist cookies, headers, and other parameters across multiple requests."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Medium", "mcq",
        "Can you set default headers on a Session object?",
        "Yes, via session.headers.update()", "No, headers must be set per request", "Only for GET requests", "Only via a config file",
        "A", "session.headers is a dict that can be updated to set default headers for all requests."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Medium", "mcq",
        "Does a Session object reuse TCP connections?",
        "Yes, via urllib3 connection pooling", "No, each request opens a new connection", "Only for HTTPS", "Only if keep-alive is set",
        "A", "Sessions use urllib3's connection pooling to reuse TCP connections for performance."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Hard", "mcq",
        "Can a Session be used as a context manager?",
        "Yes, using 'with requests.Session() as s:'", "No, sessions have no context manager support", "Only in Python 3.8+", "Only with a plugin",
        "A", "Session supports the context manager protocol, ensuring proper cleanup."))

    # --- Timeout Handling (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Easy", "mcq",
        "How do you set a timeout for a request?",
        "requests.get(url, timeout=5)", "requests.get(url, max_time=5)", "requests.get(url, wait=5)", "requests.get(url, limit=5)",
        "A", "The timeout parameter sets the number of seconds to wait for a response."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Medium", "mcq",
        "What exception is raised when a request times out?",
        "requests.exceptions.Timeout", "requests.exceptions.TimeoutError", "TimeoutError", "socket.timeout",
        "A", "requests.exceptions.Timeout is raised when the request exceeds the timeout value."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Medium", "mcq",
        "Can you set separate connect and read timeouts?",
        "Yes, timeout=(connect_timeout, read_timeout)", "No, only a single value", "Only via Session", "Only with urllib3",
        "A", "Passing a tuple sets (connect_timeout, read_timeout) separately."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Hard", "mcq",
        "What is the default timeout value in requests?",
        "None (wait indefinitely)", "30 seconds", "60 seconds", "10 seconds",
        "A", "By default, requests has no timeout and will wait indefinitely."))

    # --- Retry Mechanism (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Medium", "mcq",
        "Which urllib3 class is used to configure retries with requests?",
        "urllib3.util.retry.Retry", "urllib3.Retry", "requests.Retry", "requests.adapters.Retry",
        "A", "urllib3.util.retry.Retry configures retry logic that can be mounted on a Session."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Medium", "mcq",
        "How do you mount a retry strategy on a requests Session?",
        "session.mount('https://', HTTPAdapter(max_retries=retry))", "session.retry = retry", "session.set_retry(retry)", "session.config(retry=retry)",
        "A", "An HTTPAdapter with max_retries is mounted on the session for specific URL prefixes."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Hard", "mcq",
        "Which parameter of Retry specifies which HTTP methods to retry?",
        "allowed_methods", "method_whitelist", "retry_methods", "methods",
        "A", "allowed_methods (formerly method_whitelist) specifies which methods are retried."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Hard", "mcq",
        "What is backoff_factor in urllib3 Retry?",
        "A multiplier applied between retry attempts to add delay", "The maximum number of retries", "The timeout per retry", "The connection pool size",
        "A", "backoff_factor controls the exponential backoff delay between retries."))

    # --- SSL Verification (MCQ) ---
    qid += 1
    questions.append(_q(qid, "SSL Verification", "Easy", "mcq",
        "How do you disable SSL certificate verification?",
        "requests.get(url, verify=False)", "requests.get(url, ssl=False)", "requests.get(url, check_ssl=False)", "requests.get(url, secure=False)",
        "A", "Setting verify=False disables SSL certificate verification."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Medium", "mcq",
        "How do you specify a custom CA bundle?",
        "requests.get(url, verify='/path/to/ca-bundle.crt')", "requests.get(url, ca='/path/to/ca-bundle.crt')", "requests.get(url, cert_bundle='/path')", "requests.get(url, ssl_ca='/path')",
        "A", "Pass the path to a CA bundle file as the verify parameter."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Hard", "mcq",
        "How do you provide a client-side certificate?",
        "requests.get(url, cert=('/path/client.cert', '/path/client.key'))", "requests.get(url, client_cert='/path/client.cert')", "requests.get(url, ssl_cert='/path')", "requests.get(url, verify='/path/client.cert')",
        "A", "The cert parameter takes a tuple of (cert_file, key_file) for client certificates."))

    # --- Streaming Responses (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Medium", "mcq",
        "How do you enable streaming for a response?",
        "requests.get(url, stream=True)", "requests.get(url, chunked=True)", "requests.get(url, buffer=True)", "requests.get(url, lazy=True)",
        "A", "Setting stream=True defers downloading the response body until accessed."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Medium", "mcq",
        "Which method iterates over a streaming response in chunks?",
        "response.iter_content(chunk_size)", "response.read_chunks()", "response.stream()", "response.get_chunks()",
        "A", "iter_content() yields chunks of the response data with the specified chunk size."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Hard", "mcq",
        "What does response.iter_lines() do?",
        "Iterates over the response data one line at a time", "Returns all lines as a list", "Splits the response by newlines and returns a generator of dicts", "Counts lines in the response",
        "A", "iter_lines() is a generator that yields one line at a time from the streaming response."))

    # --- File Upload (MCQ) ---
    qid += 1
    questions.append(_q(qid, "File Upload", "Easy", "mcq",
        "Which parameter is used to upload files with requests.post()?",
        "files", "upload", "file_data", "attachments",
        "A", "The files parameter accepts a dict of {field_name: file_object} for multipart upload."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Medium", "mcq",
        "What Content-Type is set when using the files parameter?",
        "multipart/form-data", "application/octet-stream", "application/x-www-form-urlencoded", "text/plain",
        "A", "Using files automatically sets Content-Type to multipart/form-data."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Hard", "mcq",
        "How do you upload a file with a custom filename and content type?",
        "files={'file': ('name.txt', open('f'), 'text/plain')}", "files={'file': open('f'), 'name': 'name.txt'}", "files={'file': open('f')}, filename='name.txt'", "files={'file': {'data': open('f'), 'name': 'name.txt'}}",
        "A", "A tuple of (filename, file_object, content_type) allows full customization."))

    # --- Cookies (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Cookies", "Easy", "mcq",
        "How do you send cookies with a request?",
        "requests.get(url, cookies={'key': 'value'})", "requests.get(url, cookie='key=value')", "requests.get(url, headers={'Cookie': {'key': 'value'}})", "requests.get(url, jar={'key': 'value'})",
        "A", "The cookies parameter accepts a dict of cookie name-value pairs."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Medium", "mcq",
        "How do you access cookies from a response?",
        "response.cookies", "response.get_cookies()", "response.cookie_jar", "response.headers['Set-Cookie']",
        "A", "response.cookies is a RequestsCookieJar with the cookies from the response."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Hard", "mcq",
        "What class does requests use to store cookies?",
        "RequestsCookieJar", "CookieDict", "CookieStore", "http.cookiejar.CookieJar",
        "A", "RequestsCookieJar extends http.cookiejar.CookieJar with dict-like access."))

    # --- Redirects (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Redirects", "Easy", "mcq",
        "Does requests follow redirects by default?",
        "Yes", "No", "Only for POST", "Only for HTTPS",
        "A", "By default, requests follows redirects for all methods except HEAD."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Medium", "mcq",
        "How do you disable automatic redirect following?",
        "requests.get(url, allow_redirects=False)", "requests.get(url, redirect=False)", "requests.get(url, follow=False)", "requests.get(url, no_redirect=True)",
        "A", "Setting allow_redirects=False prevents requests from following redirects."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Hard", "mcq",
        "What is the default maximum number of redirects requests will follow?",
        "30", "10", "5", "Unlimited",
        "A", "requests allows up to 30 redirects by default before raising TooManyRedirects."))

    # --- Error Handling (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Error Handling", "Easy", "mcq",
        "What is the base exception class for all requests exceptions?",
        "requests.exceptions.RequestException", "requests.exceptions.Error", "requests.RequestError", "Exception",
        "A", "RequestException is the base class that all requests exceptions inherit from."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Easy", "mcq",
        "What exception is raised for DNS resolution failures?",
        "requests.exceptions.ConnectionError", "requests.exceptions.DNSError", "socket.gaierror", "requests.exceptions.URLError",
        "A", "ConnectionError is raised for network-related errors including DNS failures."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Medium", "mcq",
        "What exception is raised for too many redirects?",
        "requests.exceptions.TooManyRedirects", "requests.exceptions.RedirectError", "requests.exceptions.MaxRedirects", "requests.exceptions.LoopError",
        "A", "TooManyRedirects is raised when the maximum number of redirects is exceeded."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Hard", "mcq",
        "What exception does raise_for_status() raise for a 500 error?",
        "requests.exceptions.HTTPError", "requests.exceptions.ServerError", "requests.exceptions.InternalServerError", "requests.exceptions.StatusError",
        "A", "raise_for_status() raises HTTPError for any 4xx or 5xx status code."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Hard", "mcq",
        "Which exception is raised for invalid URLs?",
        "requests.exceptions.MissingSchema", "requests.exceptions.InvalidURL", "requests.exceptions.URLError", "ValueError",
        "A", "MissingSchema is raised when the URL lacks a scheme (e.g., http:// or https://)."))

    # --- Mock Testing with responses (MCQ) ---
    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Medium", "mcq",
        "What is the 'responses' library used for?",
        "Mocking HTTP requests made by the requests library", "Sending HTTP responses", "Parsing HTTP responses", "Caching responses",
        "A", "The responses library intercepts requests calls and returns mock responses for testing."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Medium", "mcq",
        "How do you activate the responses mock?",
        "@responses.activate decorator", "@responses.mock decorator", "@responses.enable decorator", "responses.start()",
        "A", "The @responses.activate decorator enables response mocking within the decorated function."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Hard", "mcq",
        "How do you register a mock GET response with the responses library?",
        "responses.add(responses.GET, url, json=data, status=200)", "responses.mock(url, method='GET')", "responses.register('GET', url)", "responses.get(url, return_value=data)",
        "A", "responses.add() registers a mock response for a given method and URL."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Hard", "mcq",
        "Can the responses library match requests by URL pattern?",
        "Yes, using responses.add with url_re parameter or re.compile", "No, only exact URL matching", "Only with a plugin", "Only for GET requests",
        "A", "responses supports regex URL matching via re.compile or the match parameter."))

    # --- More MCQs to reach 200 ---
    # Additional GET
    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "What HTTP status code indicates a successful GET request?",
        "200", "201", "301", "404",
        "A", "200 OK is the standard response for a successful HTTP GET request."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Medium", "mcq",
        "What does response.url contain after a GET request with redirects?",
        "The final URL after all redirects", "The original URL", "The first redirect URL", "A list of all URLs",
        "A", "response.url contains the final URL after any redirects have been followed."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Hard", "mcq",
        "What does the response.elapsed attribute return?",
        "A timedelta object representing the time between request and response", "Elapsed time in seconds as a float", "Elapsed time in milliseconds", "The server processing time",
        "A", "response.elapsed is a timedelta object measuring time from sending the request to receiving the response."))

    # Additional POST
    qid += 1
    questions.append(_q(qid, "POST Requests", "Easy", "mcq",
        "What HTTP status code typically indicates a resource was created via POST?",
        "201", "200", "204", "301",
        "A", "201 Created indicates that a new resource was successfully created."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Hard", "mcq",
        "How do you send a POST request with a generator as the body?",
        "Pass the generator to the data parameter", "Pass the generator to the json parameter", "Generators cannot be used as request bodies", "Use the stream parameter",
        "A", "Generators can be passed to data for chunk-encoded transfer."))

    # Additional Headers
    qid += 1
    questions.append(_q(qid, "Headers", "Medium", "mcq",
        "What does the User-Agent header typically contain in requests?",
        "python-requests/version_number", "Python/version_number", "Mozilla/5.0", "curl/version_number",
        "A", "requests sets the default User-Agent to 'python-requests/X.X.X'."))

    qid += 1
    questions.append(_q(qid, "Headers", "Hard", "mcq",
        "How can you access a specific header value from the response?",
        "response.headers['Content-Type'] or response.headers.get('Content-Type')", "response.header('Content-Type')", "response.get_header('Content-Type')", "response['Content-Type']",
        "A", "response.headers supports both dict-style access and .get() method."))

    # Additional Response Handling
    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "What does bool(response) return for a 200 status code?",
        "True", "False", "None", "200",
        "A", "Response objects are truthy for status codes less than 400."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Medium", "mcq",
        "What does response.ok return?",
        "True if the status code is less than 400", "True only for 200", "True for any 2xx status", "True if there was no error",
        "A", "response.ok returns True if the status code is less than 400."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Hard", "mcq",
        "What is the difference between response.text and response.content?",
        "text returns decoded str, content returns bytes", "text returns bytes, content returns str", "They are identical", "text is for JSON, content is for HTML",
        "A", "response.text decodes the content using the detected encoding; content is raw bytes."))

    # Additional Session
    qid += 1
    questions.append(_q(qid, "Session Management", "Medium", "mcq",
        "Can you set auth on a Session to apply to all requests?",
        "Yes, via session.auth = ('user', 'pass')", "No, auth must be set per request", "Only for Basic auth", "Only in Python 3.8+",
        "A", "session.auth sets default authentication for all requests made with the session."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Hard", "mcq",
        "What happens when per-request headers conflict with session-level headers?",
        "Per-request headers override session headers for that request", "Session headers always take precedence", "An error is raised", "Both are sent as duplicate headers",
        "A", "Per-request parameters are merged with session parameters, with per-request taking precedence."))

    # Additional Timeout
    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Easy", "mcq",
        "What unit is the timeout parameter specified in?",
        "Seconds", "Milliseconds", "Microseconds", "Minutes",
        "A", "The timeout parameter is specified in seconds (can be a float for sub-second)."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Hard", "mcq",
        "Does the timeout parameter limit the total download time?",
        "No, it only limits the time waiting for a connection or response from the server", "Yes, it limits total time", "It depends on the server", "Only with stream=True",
        "A", "Timeout applies to connection and read separately, not to the total download time."))

    # Additional SSL
    qid += 1
    questions.append(_q(qid, "SSL Verification", "Medium", "mcq",
        "What warning is issued when verify=False is used?",
        "InsecureRequestWarning", "SSLWarning", "SecurityWarning", "CertificateWarning",
        "A", "urllib3 issues an InsecureRequestWarning when SSL verification is disabled."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Hard", "mcq",
        "Which environment variable can set the default CA bundle for requests?",
        "REQUESTS_CA_BUNDLE", "SSL_CERT_FILE", "CA_BUNDLE_PATH", "CURL_CA_BUNDLE",
        "A", "REQUESTS_CA_BUNDLE environment variable overrides the default CA bundle path."))

    # Additional Cookies
    qid += 1
    questions.append(_q(qid, "Cookies", "Medium", "mcq",
        "How do you use a requests.cookies.RequestsCookieJar?",
        "Create it and pass to the cookies parameter", "It is only used internally", "Use it with http.client", "It replaces the headers dict",
        "A", "You can create a RequestsCookieJar, set cookies on it, and pass it to requests."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Hard", "mcq",
        "How do session cookies work across requests in a Session?",
        "Cookies set by the server are automatically stored and sent in subsequent requests", "Cookies must be manually copied between requests", "Session cookies are not supported", "Only the last response's cookies are retained",
        "A", "Sessions automatically manage cookies across requests like a web browser."))

    # Additional Redirects
    qid += 1
    questions.append(_q(qid, "Redirects", "Medium", "mcq",
        "What exception is raised when the redirect limit is reached?",
        "TooManyRedirects", "MaxRedirectError", "RedirectLimit", "ConnectionError",
        "A", "requests.exceptions.TooManyRedirects is raised when the redirect limit is exceeded."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Hard", "mcq",
        "By default, does requests follow redirects for HEAD requests?",
        "No, allow_redirects defaults to False for HEAD", "Yes, like all other methods", "HEAD requests cannot receive redirects", "It depends on the server",
        "A", "For HEAD requests, allow_redirects defaults to False."))

    # Additional Error Handling
    qid += 1
    questions.append(_q(qid, "Error Handling", "Medium", "mcq",
        "What exception is raised when a response cannot be decoded?",
        "requests.exceptions.ContentDecodingError", "requests.exceptions.DecodeError", "UnicodeDecodeError", "requests.exceptions.EncodingError",
        "A", "ContentDecodingError is raised for failures in decoding response content."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Easy", "mcq",
        "Does a 404 response raise an exception by default?",
        "No, you must call raise_for_status()", "Yes, it raises HTTPError", "Yes, it raises ConnectionError", "Yes, it raises NotFoundError",
        "A", "requests does not raise exceptions for HTTP error codes unless raise_for_status() is called."))

    # Additional Mock Testing
    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Medium", "mcq",
        "How do you mock a POST request with the responses library?",
        "responses.add(responses.POST, url, json=data, status=201)", "responses.mock_post(url, data)", "responses.post(url, response=data)", "responses.register_post(url)",
        "A", "responses.add() with responses.POST registers a mock POST response."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Hard", "mcq",
        "How do you assert that a specific request was made when using responses?",
        "Check responses.calls list", "Use responses.assert_called()", "Use responses.verify()", "Check responses.history",
        "A", "responses.calls contains a list of all intercepted requests for assertion."))

    # Additional File Upload
    qid += 1
    questions.append(_q(qid, "File Upload", "Medium", "mcq",
        "Can you upload multiple files in a single request?",
        "Yes, by passing a list of tuples to files", "No, only one file per request", "Only with multipart=True", "Only with a Session",
        "A", "Multiple files can be uploaded by passing a list of (field_name, file) tuples."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Hard", "mcq",
        "How do you send additional form data along with a file upload?",
        "Use both files and data parameters", "Include form data in the files parameter", "Use the form parameter", "Use json and files together",
        "A", "Both files and data parameters can be used together in a single POST request."))

    # Additional Streaming
    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Easy", "mcq",
        "Why would you use stream=True in a request?",
        "To avoid loading the entire response into memory at once", "To speed up the request", "To enable compression", "To enable WebSocket support",
        "A", "Streaming is useful for large responses to avoid consuming too much memory."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Hard", "mcq",
        "What happens if you don't consume a streamed response and don't close it?",
        "The connection remains open and is not returned to the pool", "It is automatically closed after 30 seconds", "Nothing, it is garbage collected", "An exception is raised",
        "A", "Unconsumed streamed responses keep the connection open, which can lead to connection pool exhaustion."))

    # Additional Query Params
    qid += 1
    questions.append(_q(qid, "Query Parameters", "Easy", "mcq",
        "What happens when you pass params={'q': 'python'} to requests.get('https://example.com')?",
        "The URL becomes https://example.com?q=python", "The body contains q=python", "A header q=python is added", "The query is sent via POST",
        "A", "The params dict is URL-encoded and appended to the URL as a query string."))

    qid += 1
    questions.append(_q(qid, "Query Parameters", "Medium", "mcq",
        "Can you pass params along with a manually included query string in the URL?",
        "Yes, both are combined", "No, params overwrites the existing query string", "An error is raised", "Only the URL query string is used",
        "A", "params are appended to any existing query string in the URL."))

    # Additional Request Body
    qid += 1
    questions.append(_q(qid, "Request Body", "Medium", "mcq",
        "What does requests do with a string passed to the data parameter?",
        "Sends it as-is in the request body", "URL-encodes it", "Raises a TypeError", "Converts it to JSON",
        "A", "Strings passed to data are sent directly without any encoding."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Hard", "mcq",
        "How can you send XML data in a POST request?",
        "Pass the XML string to data with appropriate Content-Type header", "Use the xml parameter", "Use json= with XML string", "requests does not support XML",
        "A", "XML is sent as a string via data with headers={'Content-Type': 'application/xml'}."))

    # More variety MCQs
    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Easy", "mcq",
        "Which class from requests.adapters is used to mount retry logic?",
        "HTTPAdapter", "RetryAdapter", "SessionAdapter", "ConnectionAdapter",
        "A", "HTTPAdapter from requests.adapters is used with Retry for retry configuration."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Medium", "mcq",
        "What parameter of Retry specifies which status codes trigger a retry?",
        "status_forcelist", "retry_on_status", "status_codes", "force_retry",
        "A", "status_forcelist is a list of HTTP status codes that trigger a retry."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "Which module must be imported to use the requests library?",
        "import requests", "import http.requests", "from urllib import requests", "import request",
        "A", "The requests library is imported with 'import requests'."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Medium", "mcq",
        "How do you send a list as JSON in a POST request?",
        "requests.post(url, json=[1, 2, 3])", "requests.post(url, data=[1, 2, 3])", "requests.post(url, list=[1, 2, 3])", "requests.post(url, body=[1, 2, 3])",
        "A", "The json parameter accepts any JSON-serialisable Python object including lists."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Medium", "mcq",
        "What exception class is parent to Timeout and ConnectionError?",
        "RequestException", "IOError", "BaseException", "NetworkError",
        "A", "Both Timeout and ConnectionError inherit from RequestException."))

    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Hard", "mcq",
        "What status code is commonly returned for a successful DELETE with no body?",
        "204", "200", "202", "301",
        "A", "204 No Content is the standard response for a successful DELETE with no response body."))

    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Hard", "mcq",
        "Is PATCH idempotent according to the HTTP specification?",
        "No, PATCH is not required to be idempotent", "Yes, PATCH is always idempotent", "It depends on the server", "PATCH is not an official HTTP method",
        "A", "Unlike PUT, PATCH is not required to be idempotent by the HTTP specification."))

    qid += 1
    questions.append(_q(qid, "Headers", "Easy", "mcq",
        "What header indicates the format of the response body?",
        "Content-Type", "Accept", "Content-Format", "Response-Type",
        "A", "The Content-Type header indicates the media type of the response body."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "What does response.status_code return for a not found error?",
        "404", "400", "500", "403",
        "A", "404 Not Found is returned when the requested resource does not exist."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Easy", "mcq",
        "Can a Session be used to persist cookies across requests?",
        "Yes", "No", "Only with a cookie jar", "Only for same-domain requests",
        "A", "Sessions automatically persist cookies across all requests made through them."))

    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Medium", "mcq",
        "What header does HTTPBasicAuth set?",
        "Authorization", "WWW-Authenticate", "X-Auth", "Basic-Auth",
        "A", "HTTPBasicAuth sets the Authorization header with 'Basic base64(user:pass)'."))

    qid += 1
    questions.append(_q(qid, "Authentication - Bearer Token", "Hard", "mcq",
        "What is the format of the Authorization header for Bearer auth?",
        "Bearer <token>", "Token <token>", "Auth Bearer <token>", "Basic Bearer <token>",
        "A", "The format is 'Bearer <token>' in the Authorization header."))

    qid += 1
    questions.append(_q(qid, "Authentication - OAuth", "Hard", "mcq",
        "In OAuth2, what is the purpose of the access token?",
        "To authenticate API requests on behalf of a user", "To encrypt the connection", "To store user credentials", "To verify the server identity",
        "A", "The access token is used to authenticate subsequent API requests."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Easy", "mcq",
        "What is the simplest way to upload a file using requests?",
        "requests.post(url, files={'file': open('test.txt', 'rb')})", "requests.upload(url, 'test.txt')", "requests.post(url, file='test.txt')", "requests.send_file(url, 'test.txt')",
        "A", "The files parameter with an open file object is the simplest way to upload."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Easy", "mcq",
        "What type is response.cookies?",
        "RequestsCookieJar", "dict", "list", "CookieDict",
        "A", "response.cookies is a RequestsCookieJar object."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Easy", "mcq",
        "What HTTP status codes indicate a redirect?",
        "3xx (e.g., 301, 302)", "2xx (e.g., 200, 201)", "4xx (e.g., 400, 404)", "5xx (e.g., 500, 502)",
        "A", "3xx status codes indicate redirects (301 Moved Permanently, 302 Found, etc.)."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Hard", "mcq",
        "What happens when the server sends an incomplete response?",
        "requests raises ChunkedEncodingError", "requests returns an empty response", "requests retries automatically", "The response is silently truncated",
        "A", "ChunkedEncodingError is raised when the server sends an incomplete chunked response."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Easy", "mcq",
        "What package must be installed to use the responses library?",
        "responses", "mock-responses", "requests-mock", "responses-mock",
        "A", "The 'responses' package (pip install responses) is used for mocking."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Easy", "mcq",
        "Is SSL verification enabled by default in requests?",
        "Yes", "No", "Only for HTTPS", "Only in production",
        "A", "requests verifies SSL certificates by default for HTTPS requests."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Medium", "mcq",
        "What default chunk_size does iter_content use?",
        "1 (1 byte)", "1024", "4096", "8192",
        "A", "The default chunk_size for iter_content() is 1 byte; it is recommended to set a larger value."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Medium", "mcq",
        "What exception is parent to both ConnectTimeout and ReadTimeout?",
        "Timeout", "ConnectionError", "RequestException", "IOError",
        "A", "Both ConnectTimeout and ReadTimeout inherit from Timeout."))

    qid += 1
    questions.append(_q(qid, "Query Parameters", "Hard", "mcq",
        "How are None values handled in the params dictionary?",
        "Keys with None values are not added to the URL", "None is converted to the string 'None'", "An error is raised", "None is converted to an empty string",
        "A", "requests skips parameters with None values when encoding the query string."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Easy", "mcq",
        "Can you send a request body with a GET request using the requests library?",
        "Yes, though it is unconventional", "No, GET requests cannot have bodies", "Only with a special flag", "Only in HTTP/2",
        "A", "While uncommon, the requests library allows sending a body with GET requests."))

    qid += 1
    questions.append(_q(qid, "PUT Requests", "Easy", "mcq",
        "What parameter sends JSON data in a PUT request?",
        "json", "data", "body", "content",
        "A", "The json parameter serialises data to JSON, just like in POST requests."))

    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Easy", "mcq",
        "What does requests.delete(url) return?",
        "A Response object", "True or False", "The deleted resource", "None",
        "A", "Like all requests methods, delete() returns a Response object."))

    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Easy", "mcq",
        "What parameter sends the partial update data in a PATCH request?",
        "json or data", "update", "patch_data", "partial",
        "A", "PATCH requests use the same json/data parameters as POST and PUT."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Hard", "mcq",
        "What is the purpose of the stream parameter in requests.get()?",
        "To defer downloading the response body until explicitly accessed", "To enable chunked transfer encoding on the request", "To compress the request", "To enable WebSocket upgrade",
        "A", "stream=True defers downloading so you can iterate over content in chunks."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Easy", "mcq",
        "What happens when you pass a dict to json parameter of requests.post()?",
        "It is serialised to a JSON string and sent as the body", "It is URL-encoded", "It is sent as multipart form data", "It raises an error",
        "A", "The json parameter serialises the dict to JSON and sets the appropriate Content-Type."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Medium", "mcq",
        "What does response.links return?",
        "A dict of parsed Link headers", "A list of URLs in the response", "All hyperlinks in HTML", "The redirect chain",
        "A", "response.links parses the Link header into a dict of link relations."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Hard", "mcq",
        "How do you configure a session to use a specific proxy?",
        "session.proxies = {'http': 'http://proxy:8080'}", "session.proxy = 'http://proxy:8080'", "session.set_proxy('http://proxy:8080')", "session.config(proxy='http://proxy:8080')",
        "A", "session.proxies is a dict mapping protocols to proxy URLs."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Hard", "mcq",
        "What does the raise_on_status parameter do in urllib3 Retry?",
        "When True, raises an exception after retries are exhausted on bad status codes", "Raises on any non-200 status", "Calls raise_for_status automatically", "Enables status code checking",
        "A", "raise_on_status controls whether a MaxRetryError is raised after retries for bad status codes."))

    qid += 1
    questions.append(_q(qid, "Headers", "Medium", "mcq",
        "What header should you set to request a specific response format?",
        "Accept", "Content-Type", "Format", "Response-Format",
        "A", "The Accept header tells the server what content types the client can handle."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Medium", "mcq",
        "What happens if you forget to open the file in binary mode ('rb') when uploading?",
        "The upload may fail or corrupt binary files", "It works the same way", "requests automatically converts to binary", "A TypeError is raised immediately",
        "A", "Files should be opened in binary mode to avoid encoding issues during upload."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Medium", "mcq",
        "How can you catch all requests-related exceptions?",
        "except requests.exceptions.RequestException", "except requests.Error", "except Exception", "except requests.RequestError",
        "A", "RequestException is the base class for all requests exceptions."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Medium", "mcq",
        "Can you access a specific cookie value from response.cookies?",
        "Yes, using response.cookies['name'] or response.cookies.get('name')", "No, you can only iterate over cookies", "Only using response.headers['Set-Cookie']", "Only in a Session",
        "A", "RequestsCookieJar supports dict-like access to cookie values."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Medium", "mcq",
        "How do you check if a GET request was successful without checking status_code directly?",
        "Use response.ok or response.raise_for_status()", "Use response.success", "Use response.is_valid()", "Use response.check()",
        "A", "response.ok returns True for successful responses; raise_for_status() raises on errors."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Medium", "mcq",
        "How do you suppress InsecureRequestWarning when using verify=False?",
        "import urllib3; urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)", "import warnings; warnings.filterwarnings('ignore')", "requests.disable_ssl_warnings()", "Setting verify=False automatically suppresses it",
        "A", "urllib3.disable_warnings() with InsecureRequestWarning suppresses the warning."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Medium", "mcq",
        "Can the responses library simulate connection errors?",
        "Yes, using responses.add with body=ConnectionError()", "No, it can only mock successful responses", "Only with unittest.mock", "Only timeout errors",
        "A", "responses can simulate exceptions by passing an exception to the body parameter."))

    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Easy", "mcq",
        "What module contains HTTPBasicAuth?",
        "requests.auth", "requests.basic", "requests.authentication", "requests.http",
        "A", "HTTPBasicAuth is located in the requests.auth module."))

    qid += 1
    questions.append(_q(qid, "Authentication - Bearer Token", "Medium", "mcq",
        "Is there a built-in BearerAuth class in the requests library?",
        "No, you must set the header manually or create a custom auth class", "Yes, requests.auth.BearerAuth", "Yes, requests.BearerToken", "Yes, in requests 2.28+",
        "A", "requests has no built-in Bearer auth class; use headers or subclass AuthBase."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Medium", "mcq",
        "What does response.is_redirect indicate?",
        "Whether the response is a redirect that was not followed", "Whether any redirects occurred", "Whether the URL changed", "Whether the response has a Location header",
        "A", "response.is_redirect is True if the response is a redirect and was not automatically followed."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Medium", "mcq",
        "Is it important to close a streaming response?",
        "Yes, to release the connection back to the pool", "No, it is closed automatically", "Only if an error occurs", "Only for large files",
        "A", "You should call response.close() or use a context manager to release the connection."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "What attribute gives the reason phrase for the status code (e.g., 'OK')?",
        "response.reason", "response.message", "response.status_message", "response.phrase",
        "A", "response.reason contains the textual reason phrase (e.g., 'OK', 'Not Found')."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Easy", "mcq",
        "Can you pass a float value as the timeout?",
        "Yes, e.g. timeout=0.5 for half a second", "No, only integers", "Only for connect timeout", "Only in Python 3.8+",
        "A", "Float values are accepted, allowing sub-second precision."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Easy", "mcq",
        "What does max_retries parameter of HTTPAdapter control?",
        "Maximum number of retry attempts", "Maximum connections", "Maximum timeout", "Maximum redirects",
        "A", "max_retries sets the maximum number of retry attempts for failed requests."))

    qid += 1
    questions.append(_q(qid, "PUT Requests", "Hard", "mcq",
        "Can you upload a file using PUT in the requests library?",
        "Yes, using data=open('file', 'rb')", "No, only POST supports file uploads", "Only with the files parameter", "Only via multipart",
        "A", "PUT can send file data via the data parameter with an open file object."))

    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Hard", "mcq",
        "What is the recommended way to handle the response from a DELETE request?",
        "Check the status code and optionally call raise_for_status()", "DELETE requests don't return responses", "Always parse the JSON body", "Ignore the response",
        "A", "Check the status code (often 204 or 200) and use raise_for_status() for error handling."))

    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Medium", "mcq",
        "Which Content-Type is typically used for JSON PATCH operations?",
        "application/json", "application/json-patch+json", "text/json", "application/patch",
        "A", "Standard JSON data sent with PATCH uses application/json (json-patch+json is for JSON Patch spec)."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Easy", "mcq",
        "Does using @responses.activate block real HTTP requests?",
        "Yes, unmatched requests raise ConnectionError by default", "No, unmatched requests go through normally", "It depends on configuration", "Only GET requests are blocked",
        "A", "By default, @responses.activate blocks all real HTTP requests."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Easy", "mcq",
        "What exception is raised when the request URL is invalid?",
        "requests.exceptions.InvalidURL", "ValueError", "requests.exceptions.BadURL", "urllib.error.URLError",
        "A", "InvalidURL is raised for malformed or invalid URLs."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Easy", "mcq",
        "How do you close a Session object?",
        "session.close()", "session.disconnect()", "session.end()", "del session",
        "A", "session.close() releases all adapters and underlying connections."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "What does requests.get(url).text return for a JSON API?",
        "The JSON as a string", "A parsed dictionary", "A bytes object", "A JSON object",
        "A", "response.text always returns a string; use .json() to get a parsed object."))

    qid += 1
    questions.append(_q(qid, "Headers", "Hard", "mcq",
        "How do you inspect the request headers that were actually sent?",
        "response.request.headers", "response.sent_headers", "requests.last_headers", "response.outgoing_headers",
        "A", "response.request.headers contains the headers from the PreparedRequest that was sent."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Hard", "mcq",
        "What is response.apparent_encoding?",
        "The encoding detected by chardet/charset_normalizer from the content", "The encoding from the Content-Type header", "The system default encoding", "The encoding specified by the user",
        "A", "apparent_encoding uses chardet/charset_normalizer to detect encoding from content bytes."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Hard", "mcq",
        "How do you convert response cookies to a regular dict?",
        "dict(response.cookies) or response.cookies.get_dict()", "response.cookies.to_dict()", "response.cookies.as_dict()", "json.loads(response.cookies)",
        "A", "dict() constructor or .get_dict() converts RequestsCookieJar to a plain dictionary."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Hard", "mcq",
        "What status code triggers a POST-to-GET conversion during redirect?",
        "302 and 303", "301 only", "307", "All 3xx codes",
        "A", "302 Found and 303 See Other cause a POST to be converted to GET on redirect."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Hard", "mcq",
        "What library does requests use internally for SSL verification?",
        "certifi (for CA bundle) and urllib3 (for SSL handling)", "OpenSSL directly", "ssl module only", "pyOpenSSL exclusively",
        "A", "requests uses certifi for the default CA bundle and urllib3 for SSL/TLS handling."))

    qid += 1
    questions.append(_q(qid, "Authentication - OAuth", "Medium", "mcq",
        "What is the OAuth2 Authorization Code flow used for?",
        "Server-side applications that can securely store a client secret", "Public JavaScript applications", "Machine-to-machine communication only", "Mobile apps only",
        "A", "The Authorization Code flow is designed for server-side apps that can protect secrets."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Hard", "mcq",
        "How do you download a large file efficiently with requests?",
        "Use stream=True and iter_content() writing chunks to disk", "Use requests.download(url)", "Use response.save_to_file()", "Use response.content and write it all at once",
        "A", "Streaming with iter_content() processes the file in chunks to avoid high memory usage."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Hard", "mcq",
        "How do you send in-memory data as a file upload without a real file?",
        "files={'file': ('name.txt', io.BytesIO(b'data'), 'text/plain')}", "files={'file': b'data'}", "data=b'data', filename='name.txt'", "upload_data=b'data'",
        "A", "A tuple with filename and a BytesIO object simulates a file upload from memory."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Hard", "mcq",
        "What is the relationship between requests.exceptions.ConnectionError and Python's built-in ConnectionError?",
        "requests.exceptions.ConnectionError inherits from both IOError and RequestException, not from built-in ConnectionError", "They are the same class", "requests.exceptions.ConnectionError inherits from built-in ConnectionError", "There is no built-in ConnectionError in Python",
        "A", "Despite the same name, requests' ConnectionError does not inherit from Python's built-in ConnectionError."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Hard", "mcq",
        "How can you make the responses library pass through certain requests to the real server?",
        "Use responses.add_passthrough() with the URL", "Set passthrough=True on responses.add()", "This is not possible with responses", "Use responses.real(url)",
        "A", "responses.add_passthrough() allows specific URLs to bypass mocking and reach the real server."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Medium", "mcq",
        "What is the prepared request body accessible from?",
        "response.request.body", "response.body", "response.request.data", "response.sent_body",
        "A", "response.request.body contains the body of the PreparedRequest that was sent."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Medium", "mcq",
        "How do you set the maximum number of connections in a session's pool?",
        "Mount an HTTPAdapter with pool_connections and pool_maxsize", "session.max_connections = N", "session.pool_size = N", "session.config(max_connections=N)",
        "A", "HTTPAdapter accepts pool_connections and pool_maxsize for connection pool configuration."))

    qid += 1
    questions.append(_q(qid, "GET Requests", "Medium", "mcq",
        "How do you send a GET request with basic auth and a timeout?",
        "requests.get(url, auth=('user', 'pass'), timeout=10)", "requests.get(url, login='user:pass', wait=10)", "requests.get(url, credentials=('user','pass'), max_time=10)", "requests.get(url).auth('user','pass').timeout(10)",
        "A", "Multiple keyword arguments can be combined in a single requests.get() call."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Hard", "mcq",
        "What is the PreparedRequest and how does it relate to POST requests?",
        "It is the actual request object created after merging Session and per-request settings, sent by the transport adapter", "It is a draft request not yet sent", "It is a request that was cached", "It is a request waiting in the queue",
        "A", "PreparedRequest is the fully assembled request sent by the adapter, accessible via response.request."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Medium", "mcq",
        "What is the default behaviour when all retries are exhausted?",
        "A MaxRetryError is raised (wrapped as ConnectionError)", "The last response is returned", "None is returned", "A Timeout error is raised",
        "A", "When retries are exhausted, urllib3 raises MaxRetryError which requests wraps as ConnectionError."))

    # --- Additional MCQs to reach 200 ---
    qid += 1
    questions.append(_q(qid, "GET Requests", "Easy", "mcq",
        "What is the return type of response.json() for a JSON array response?",
        "list", "dict", "str", "tuple",
        "A", "A JSON array is deserialised as a Python list."))

    qid += 1
    questions.append(_q(qid, "POST Requests", "Medium", "mcq",
        "What encoding is used when passing a dict to the data parameter?",
        "application/x-www-form-urlencoded", "multipart/form-data", "application/json", "text/plain",
        "A", "A dict passed to data is automatically form-encoded."))

    qid += 1
    questions.append(_q(qid, "PUT Requests", "Medium", "mcq",
        "What status code is commonly returned for a successful PUT that updates an existing resource?",
        "200", "201", "204", "301",
        "A", "200 OK is commonly returned when a PUT successfully updates a resource."))

    qid += 1
    questions.append(_q(qid, "DELETE Requests", "Easy", "mcq",
        "Is a response body required for a successful DELETE response?",
        "No, a 204 No Content response has no body", "Yes, the deleted resource must be returned", "Yes, a confirmation message is required", "Only for REST APIs",
        "A", "204 No Content is a valid DELETE response with no body."))

    qid += 1
    questions.append(_q(qid, "PATCH Requests", "Easy", "mcq",
        "What does PATCH stand for in the context of HTTP?",
        "It is not an acronym; it refers to applying a partial modification", "Partial Application To Change HTTP", "Protocol for Amending Through Complete Handling", "It stands for PATCHwork",
        "A", "PATCH is simply an HTTP method name for partial resource modifications."))

    qid += 1
    questions.append(_q(qid, "Headers", "Medium", "mcq",
        "What is the purpose of the Content-Length header?",
        "Indicates the size of the request/response body in bytes", "Indicates the number of headers", "Limits the response size", "Indicates the URL length",
        "A", "Content-Length specifies the size of the body in bytes."))

    qid += 1
    questions.append(_q(qid, "Query Parameters", "Easy", "mcq",
        "Are query parameters visible in the URL?",
        "Yes, they are appended after the ? character", "No, they are sent in the body", "Only in POST requests", "Only when using HTTPS",
        "A", "Query parameters are part of the URL, visible after the ? separator."))

    qid += 1
    questions.append(_q(qid, "Request Body", "Easy", "mcq",
        "Which HTTP methods typically include a request body?",
        "POST, PUT, PATCH", "GET, HEAD", "DELETE only", "All methods",
        "A", "POST, PUT, and PATCH are the methods that commonly include request bodies."))

    qid += 1
    questions.append(_q(qid, "Response Handling", "Easy", "mcq",
        "What attribute tells you the HTTP version used for the response?",
        "response.raw.version", "response.http_version", "response.version", "response.protocol",
        "A", "response.raw.version from the urllib3 response gives the HTTP version."))

    qid += 1
    questions.append(_q(qid, "Authentication - Basic", "Hard", "mcq",
        "Can HTTPBasicAuth be used with a Session object?",
        "Yes, set session.auth = HTTPBasicAuth('user', 'pass')", "No, sessions don't support auth objects", "Only with the auth parameter per request", "Only in Python 3.10+",
        "A", "session.auth accepts any auth handler including HTTPBasicAuth."))

    qid += 1
    questions.append(_q(qid, "Authentication - Bearer Token", "Hard", "mcq",
        "How can you create a reusable Bearer auth class?",
        "Subclass AuthBase and implement __call__ to set the Authorization header", "Use a decorator on each request function", "Modify the requests module globally", "Use session.headers only",
        "A", "Subclassing AuthBase allows creating reusable custom auth handlers."))

    qid += 1
    questions.append(_q(qid, "Session Management", "Hard", "mcq",
        "What is the default pool_maxsize for HTTPAdapter?",
        "10", "5", "20", "100",
        "A", "HTTPAdapter defaults to pool_maxsize=10 connections per host."))

    qid += 1
    questions.append(_q(qid, "Timeout Handling", "Hard", "mcq",
        "What is the difference between ConnectTimeout and ReadTimeout?",
        "ConnectTimeout occurs during connection establishment; ReadTimeout during data receipt", "They are the same exception", "ConnectTimeout is for DNS; ReadTimeout is for SSL", "ConnectTimeout is deprecated",
        "A", "ConnectTimeout is raised during TCP connection; ReadTimeout while waiting for data."))

    qid += 1
    questions.append(_q(qid, "Retry Mechanism", "Easy", "mcq",
        "What does the total parameter in Retry represent?",
        "The maximum total number of retries allowed", "The total timeout in seconds", "The total number of connections", "The total request size",
        "A", "total sets the maximum number of retry attempts."))

    qid += 1
    questions.append(_q(qid, "SSL Verification", "Easy", "mcq",
        "What is SSL/TLS used for in HTTPS?",
        "Encrypting communication between client and server", "Compressing data", "Speeding up connections", "Caching responses",
        "A", "SSL/TLS provides encryption for secure communication over HTTPS."))

    qid += 1
    questions.append(_q(qid, "Streaming Responses", "Easy", "mcq",
        "What does stream=False (the default) mean?",
        "The entire response body is downloaded immediately", "No streaming is supported", "The response is cached", "The connection is kept alive",
        "A", "By default, the response body is downloaded immediately into memory."))

    qid += 1
    questions.append(_q(qid, "File Upload", "Easy", "mcq",
        "Should files be opened in binary mode for upload?",
        "Yes, always use 'rb' mode", "No, text mode works fine", "Only for images", "Only for large files",
        "A", "Binary mode ('rb') ensures files are uploaded correctly without encoding issues."))

    qid += 1
    questions.append(_q(qid, "Cookies", "Easy", "mcq",
        "What are HTTP cookies used for?",
        "Storing session state between client and server", "Encrypting data", "Compressing responses", "Caching DNS lookups",
        "A", "Cookies maintain session state in the otherwise stateless HTTP protocol."))

    qid += 1
    questions.append(_q(qid, "Redirects", "Easy", "mcq",
        "What is an HTTP redirect?",
        "A response that directs the client to a different URL", "A server error", "A client authentication request", "A request cancellation",
        "A", "Redirects (3xx) instruct the client to follow a different URL."))

    qid += 1
    questions.append(_q(qid, "Error Handling", "Easy", "mcq",
        "Should you always check the status code of a response?",
        "Yes, to ensure the request was successful", "No, requests raises exceptions automatically", "Only for POST requests", "Only in production",
        "A", "Always check status codes or use raise_for_status() since requests doesn't raise for HTTP errors by default."))

    qid += 1
    questions.append(_q(qid, "Mock Testing with responses", "Medium", "mcq",
        "Can responses library mock different HTTP methods for the same URL?",
        "Yes, each method is registered separately", "No, only one method per URL", "Only GET and POST", "Only with different status codes",
        "A", "Different methods (GET, POST, etc.) for the same URL are separate mock entries."))

    qid += 1
    questions.append(_q(qid, "Authentication - OAuth", "Hard", "mcq",
        "What is a refresh token in OAuth2?",
        "A token used to obtain a new access token when the current one expires", "A token that replaces the client secret", "A token sent with every request", "A token for logging out",
        "A", "Refresh tokens allow obtaining new access tokens without re-authentication."))

    # Count current MCQs
    mcq_count = len([q for q in questions if q["type"] == "mcq"])

    # ===================================================================
    # OUTPUT questions (100) -- code_snippet is filled
    # ===================================================================

    output_questions = [
        (_q(0, "GET Requests", "Easy", "output",
            "What is the output of this code?",
            "200", "404", "<Response [200]>", "None",
            "A", "response.status_code returns the integer status code 200 for a successful request.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(response.status_code)")),

        (_q(0, "GET Requests", "Easy", "output",
            "What will this code print?",
            "True", "False", "200", "None",
            "A", "response.ok returns True when the status code is less than 400.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(response.ok)")),

        (_q(0, "Response Handling", "Easy", "output",
            "What type does this expression return?",
            "<class 'dict'>", "<class 'str'>", "<class 'list'>", "<class 'bytes'>",
            "A", "response.json() parses JSON and returns a Python dictionary.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(type(response.json()))")),

        (_q(0, "Response Handling", "Easy", "output",
            "What will be printed?",
            "<class 'str'>", "<class 'bytes'>", "<class 'dict'>", "<class 'NoneType'>",
            "A", "response.text returns a string.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(type(response.text))")),

        (_q(0, "Response Handling", "Easy", "output",
            "What will be printed?",
            "<class 'bytes'>", "<class 'str'>", "<class 'dict'>", "<class 'list'>",
            "A", "response.content returns bytes.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(type(response.content))")),

        (_q(0, "Headers", "Medium", "output",
            "What will this code print?",
            "application/json", "text/html", "text/plain", "None",
            "A", "httpbin.org/get returns JSON, so the Content-Type is application/json.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(response.headers['Content-Type'].split(';')[0])")),

        (_q(0, "Headers", "Medium", "output",
            "What will the code print?",
            "application/json", "None", "text/html", "KeyError",
            "A", "Header lookups are case-insensitive, so 'content-type' works.",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(response.headers.get('content-type', 'None').split(';')[0])")),

        (_q(0, "Query Parameters", "Easy", "output",
            "What URL will be requested?",
            "https://httpbin.org/get?name=alice&age=30", "https://httpbin.org/get", "https://httpbin.org/get?params={'name':'alice','age':'30'}", "Error",
            "A", "The params dict is URL-encoded and appended as a query string.",
            "import requests\nresponse = requests.get('https://httpbin.org/get', params={'name': 'alice', 'age': 30})\nprint(response.url)")),

        (_q(0, "Query Parameters", "Medium", "output",
            "What will response.url be?",
            "https://httpbin.org/get?key=v1&key=v2", "https://httpbin.org/get?key=['v1','v2']", "https://httpbin.org/get?key=v1+v2", "Error",
            "A", "List values cause the key to be repeated for each element.",
            "import requests\nresponse = requests.get('https://httpbin.org/get', params={'key': ['v1', 'v2']})\nprint(response.url)")),

        (_q(0, "POST Requests", "Easy", "output",
            "What status code is typically returned?",
            "200", "201", "204", "404",
            "A", "httpbin.org/post returns 200 for successful POST requests.",
            "import requests\nresponse = requests.post('https://httpbin.org/post', data={'key': 'value'})\nprint(response.status_code)")),

        (_q(0, "POST Requests", "Medium", "output",
            "What Content-Type will be in the request headers?",
            "application/json", "application/x-www-form-urlencoded", "text/plain", "multipart/form-data",
            "A", "Using json= sets Content-Type to application/json automatically.",
            "import requests\nresponse = requests.post('https://httpbin.org/post', json={'key': 'value'})\ndata = response.json()\nprint(data['headers']['Content-Type'])")),

        (_q(0, "POST Requests", "Medium", "output",
            "What Content-Type will the request have?",
            "application/x-www-form-urlencoded", "application/json", "text/plain", "multipart/form-data",
            "A", "Using data= with a dict sends form-encoded data.",
            "import requests\nresponse = requests.post('https://httpbin.org/post', data={'key': 'value'})\ndata = response.json()\nprint(data['headers']['Content-Type'])")),

        (_q(0, "Response Handling", "Medium", "output",
            "What will be printed?",
            "No error is raised", "HTTPError is raised", "ConnectionError is raised", "None",
            "A", "A 200 response does not trigger raise_for_status().",
            "import requests\nresponse = requests.get('https://httpbin.org/get')\ntry:\n    response.raise_for_status()\n    print('No error is raised')\nexcept Exception as e:\n    print(type(e).__name__)")),

        (_q(0, "Error Handling", "Medium", "output",
            "What will be printed?",
            "HTTPError", "ConnectionError", "No error", "StatusError",
            "A", "A 404 response causes raise_for_status() to raise HTTPError.",
            "import requests\nresponse = requests.get('https://httpbin.org/status/404')\ntry:\n    response.raise_for_status()\n    print('No error')\nexcept requests.exceptions.HTTPError:\n    print('HTTPError')")),

        (_q(0, "Error Handling", "Hard", "output",
            "What will be printed?",
            "Timeout", "ConnectionError", "RequestException", "No error",
            "A", "A timeout of 0.001 seconds will almost certainly time out.",
            "import requests\ntry:\n    requests.get('https://httpbin.org/delay/5', timeout=0.001)\n    print('No error')\nexcept requests.exceptions.Timeout:\n    print('Timeout')\nexcept Exception:\n    print('Other error')")),

        (_q(0, "Timeout Handling", "Easy", "output",
            "What exception type is caught?",
            "Timeout", "ConnectionError", "HTTPError", "ValueError",
            "A", "The timeout parameter causes a Timeout exception when exceeded.",
            "import requests\ntry:\n    requests.get('https://httpbin.org/delay/10', timeout=1)\nexcept requests.exceptions.Timeout:\n    print('Timeout')")),

        (_q(0, "Session Management", "Easy", "output",
            "What will be printed?",
            "200", "201", "None", "Error",
            "A", "Sessions work just like regular get/post but reuse connections.",
            "import requests\nwith requests.Session() as s:\n    r = s.get('https://httpbin.org/get')\n    print(r.status_code)")),

        (_q(0, "Session Management", "Medium", "output",
            "What will the custom header value be in the response?",
            "TestValue", "None", "KeyError", "Error",
            "A", "Session headers are sent with every request.",
            "import requests\ns = requests.Session()\ns.headers.update({'X-Custom': 'TestValue'})\nr = s.get('https://httpbin.org/get')\nprint(r.json()['headers'].get('X-Custom'))\ns.close()")),

        (_q(0, "Authentication - Basic", "Medium", "output",
            "What will be printed?",
            "200", "401", "403", "None",
            "A", "httpbin.org/basic-auth returns 200 with correct credentials.",
            "import requests\nr = requests.get('https://httpbin.org/basic-auth/user/pass', auth=('user', 'pass'))\nprint(r.status_code)")),

        (_q(0, "Authentication - Basic", "Medium", "output",
            "What will be printed?",
            "401", "200", "403", "None",
            "A", "Wrong credentials result in a 401 Unauthorized response.",
            "import requests\nr = requests.get('https://httpbin.org/basic-auth/user/pass', auth=('wrong', 'creds'))\nprint(r.status_code)")),

        (_q(0, "Cookies", "Medium", "output",
            "What will be printed?",
            "chocolate", "None", "KeyError", "Error",
            "A", "httpbin.org/cookies/set sets a cookie that is returned in the response.",
            "import requests\ns = requests.Session()\ns.get('https://httpbin.org/cookies/set/flavor/chocolate')\nr = s.get('https://httpbin.org/cookies')\nprint(r.json()['cookies'].get('flavor'))\ns.close()")),

        (_q(0, "Redirects", "Easy", "output",
            "What will be printed?",
            "200", "302", "301", "404",
            "A", "requests follows redirects by default, so the final status is 200.",
            "import requests\nr = requests.get('https://httpbin.org/redirect/1')\nprint(r.status_code)")),

        (_q(0, "Redirects", "Medium", "output",
            "What will be printed?",
            "302", "200", "301", "404",
            "A", "With allow_redirects=False, the redirect response itself is returned.",
            "import requests\nr = requests.get('https://httpbin.org/redirect/1', allow_redirects=False)\nprint(r.status_code)")),

        (_q(0, "Redirects", "Medium", "output",
            "What will be printed?",
            "1", "0", "2", "None",
            "A", "One redirect occurred, so response.history has one entry.",
            "import requests\nr = requests.get('https://httpbin.org/redirect/1')\nprint(len(r.history))")),

        (_q(0, "Response Handling", "Easy", "output",
            "What will be the output?",
            "OK", "200", "True", "Success",
            "A", "response.reason is 'OK' for a 200 status code.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.reason)")),

        (_q(0, "Response Handling", "Medium", "output",
            "What will this print?",
            "True", "False", "None", "Error",
            "A", "The expression 'args' in r.json() checks if 'args' key exists in the JSON dict.",
            "import requests\nr = requests.get('https://httpbin.org/get', params={'q': 'test'})\nprint('args' in r.json())")),

        (_q(0, "Response Handling", "Hard", "output",
            "What will this print?",
            "True", "False", "None", "Error",
            "A", "response.is_redirect is False because the final response is not a redirect.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.is_redirect)")),

        (_q(0, "GET Requests", "Medium", "output",
            "What type will be printed?",
            "<class 'requests.models.Response'>", "<class 'dict'>", "<class 'str'>", "<class 'http.client.HTTPResponse'>",
            "A", "requests.get() returns a requests.models.Response object.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(type(r))")),

        (_q(0, "Error Handling", "Easy", "output",
            "What will be printed?",
            "False", "True", "Error", "None",
            "A", "A 404 status code makes response.ok return False.",
            "import requests\nr = requests.get('https://httpbin.org/status/404')\nprint(r.ok)")),

        (_q(0, "Error Handling", "Medium", "output",
            "What will be printed?",
            "404", "200", "Error", "None",
            "A", "requests does not raise an exception for 404; it returns the Response.",
            "import requests\nr = requests.get('https://httpbin.org/status/404')\nprint(r.status_code)")),

        (_q(0, "PUT Requests", "Easy", "output",
            "What will be printed?",
            "200", "201", "204", "Error",
            "A", "httpbin.org/put returns 200 for a valid PUT request.",
            "import requests\nr = requests.put('https://httpbin.org/put', json={'key': 'value'})\nprint(r.status_code)")),

        (_q(0, "DELETE Requests", "Easy", "output",
            "What will be printed?",
            "200", "204", "404", "Error",
            "A", "httpbin.org/delete returns 200 for a valid DELETE request.",
            "import requests\nr = requests.delete('https://httpbin.org/delete')\nprint(r.status_code)")),

        (_q(0, "PATCH Requests", "Easy", "output",
            "What will be printed?",
            "200", "204", "201", "Error",
            "A", "httpbin.org/patch returns 200 for a valid PATCH request.",
            "import requests\nr = requests.patch('https://httpbin.org/patch', json={'field': 'new_value'})\nprint(r.status_code)")),

        (_q(0, "POST Requests", "Hard", "output",
            "What will 'json' key contain in the response?",
            "{'name': 'Alice', 'age': 30}", "None", "Error", "{'name': 'Alice'}",
            "A", "When using json=, httpbin echoes the JSON body in the 'json' key.",
            "import requests\nr = requests.post('https://httpbin.org/post', json={'name': 'Alice', 'age': 30})\nprint(r.json()['json'])")),

        (_q(0, "Query Parameters", "Easy", "output",
            "What will be printed?",
            "{'search': 'python'}", "python", "search=python", "None",
            "A", "httpbin echoes query params in the 'args' key of the JSON response.",
            "import requests\nr = requests.get('https://httpbin.org/get', params={'search': 'python'})\nprint(r.json()['args'])")),

        (_q(0, "Headers", "Easy", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The custom header will be present in the echoed request headers.",
            "import requests\nr = requests.get('https://httpbin.org/get', headers={'X-Test': '123'})\nprint('X-Test' in r.json()['headers'])")),

        (_q(0, "Cookies", "Easy", "output",
            "What type is response.cookies?",
            "<class 'requests.cookies.RequestsCookieJar'>", "<class 'dict'>", "<class 'list'>", "<class 'http.cookiejar.CookieJar'>",
            "A", "response.cookies is a RequestsCookieJar instance.",
            "import requests\nr = requests.get('https://httpbin.org/cookies/set/test/value', allow_redirects=False)\nprint(type(r.cookies))")),

        (_q(0, "SSL Verification", "Medium", "output",
            "What will happen?",
            "The request succeeds with a warning", "SSLError is raised", "The request fails silently", "ConnectionError is raised",
            "A", "verify=False disables SSL checking but emits InsecureRequestWarning.",
            "import requests\nimport warnings\nwarnings.simplefilter('always')\nr = requests.get('https://httpbin.org/get', verify=False)\nprint('Request succeeded' if r.ok else 'Request failed')")),

        (_q(0, "SSL Verification", "Hard", "output",
            "What exception will be raised?",
            "SSLError", "ConnectionError", "Timeout", "No exception",
            "A", "Pointing verify to a non-existent file raises an SSLError or IOError.",
            "import requests\ntry:\n    requests.get('https://httpbin.org/get', verify='/nonexistent/ca-bundle.crt')\n    print('No exception')\nexcept requests.exceptions.SSLError:\n    print('SSLError')\nexcept Exception as e:\n    print(type(e).__name__)")),

        (_q(0, "Session Management", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "Session cookies persist between requests.",
            "import requests\ns = requests.Session()\ns.get('https://httpbin.org/cookies/set/session_id/abc123')\nr = s.get('https://httpbin.org/cookies')\nprint('session_id' in r.json()['cookies'])\ns.close()")),

        (_q(0, "Error Handling", "Hard", "output",
            "What will be printed?",
            "MissingSchema", "InvalidURL", "ConnectionError", "ValueError",
            "A", "A URL without a scheme raises MissingSchema.",
            "import requests\ntry:\n    requests.get('not-a-valid-url')\nexcept requests.exceptions.MissingSchema:\n    print('MissingSchema')\nexcept Exception as e:\n    print(type(e).__name__)")),

        (_q(0, "Streaming Responses", "Medium", "output",
            "What type does iter_content yield?",
            "<class 'bytes'>", "<class 'str'>", "<class 'int'>", "<class 'list'>",
            "A", "iter_content() yields bytes chunks.",
            "import requests\nr = requests.get('https://httpbin.org/get', stream=True)\nfor chunk in r.iter_content(chunk_size=1024):\n    print(type(chunk))\n    break\nr.close()")),

        (_q(0, "Streaming Responses", "Hard", "output",
            "What will be printed?",
            "True", "False", "None", "Error",
            "A", "With stream=True, content is not downloaded until accessed.",
            "import requests\nr = requests.get('https://httpbin.org/get', stream=True)\nprint(r._content_consumed)\nr.close()")),

        (_q(0, "Mock Testing with responses", "Medium", "output",
            "What will be printed?",
            "200 - mocked", "ConnectionError", "Error", "None",
            "A", "The responses library intercepts the request and returns the mocked response.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'https://api.example.com/data',\n                  json={'message': 'mocked'}, status=200)\n    r = requests.get('https://api.example.com/data')\n    print(f'{r.status_code} - {r.json()[\"message\"]}')\n\ntest()")),

        (_q(0, "Mock Testing with responses", "Hard", "output",
            "What will be printed?",
            "1", "0", "2", "Error",
            "A", "One request was made, so responses.calls has length 1.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'https://api.example.com/data',\n                  json={}, status=200)\n    requests.get('https://api.example.com/data')\n    print(len(responses.calls))\n\ntest()")),

        (_q(0, "Authentication - Bearer Token", "Medium", "output",
            "What will the Authorization header contain?",
            "Bearer my_token_123", "Basic my_token_123", "Token my_token_123", "None",
            "A", "The custom Authorization header is sent as-is.",
            "import requests\nr = requests.get('https://httpbin.org/get',\n                 headers={'Authorization': 'Bearer my_token_123'})\nprint(r.json()['headers']['Authorization'])")),

        (_q(0, "Request Body", "Medium", "output",
            "What will the 'data' field show in httpbin response?",
            "raw text body", "None", "", "Error",
            "A", "A string passed to data is sent as-is in the body.",
            "import requests\nr = requests.post('https://httpbin.org/post', data='raw text body')\nprint(r.json()['data'])")),

        (_q(0, "Request Body", "Hard", "output",
            "What Content-Type will the request have?",
            "application/xml", "text/xml", "application/json", "text/plain",
            "A", "The explicitly set Content-Type header is used.",
            "import requests\nxml = '<root><item>test</item></root>'\nr = requests.post('https://httpbin.org/post', data=xml,\n                  headers={'Content-Type': 'application/xml'})\nprint(r.json()['headers']['Content-Type'])")),

        (_q(0, "Cookies", "Hard", "output",
            "What will be printed?",
            "{'custom_cookie': 'cookie_value'}", "cookie_value", "None", "Error",
            "A", "httpbin echoes the sent cookies.",
            "import requests\nr = requests.get('https://httpbin.org/cookies', cookies={'custom_cookie': 'cookie_value'})\nprint(r.json()['cookies'])")),

        (_q(0, "Response Handling", "Hard", "output",
            "What type does response.elapsed return?",
            "<class 'datetime.timedelta'>", "<class 'float'>", "<class 'int'>", "<class 'str'>",
            "A", "response.elapsed is a datetime.timedelta object.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(type(r.elapsed))")),

        (_q(0, "GET Requests", "Hard", "output",
            "What will be printed?",
            "gzip", "deflate", "identity", "None",
            "A", "requests automatically sends Accept-Encoding: gzip, deflate and the response is often gzip.",
            "import requests\nr = requests.get('https://httpbin.org/gzip')\ndata = r.json()\nprint('gzip' if data.get('gzipped') else 'not gzip')")),

        (_q(0, "Headers", "Hard", "output",
            "What will be printed?",
            "True", "False", "KeyError", "None",
            "A", "CaseInsensitiveDict allows case-insensitive header access.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.headers.get('CONTENT-TYPE') == r.headers.get('content-type'))")),

        (_q(0, "Session Management", "Medium", "output",
            "What will the User-Agent be?",
            "CustomAgent/1.0", "python-requests/2.x.x", "None", "Error",
            "A", "Session-level headers override the default User-Agent.",
            "import requests\ns = requests.Session()\ns.headers['User-Agent'] = 'CustomAgent/1.0'\nr = s.get('https://httpbin.org/get')\nprint(r.json()['headers']['User-Agent'])\ns.close()")),

        (_q(0, "Error Handling", "Easy", "output",
            "What will be printed?",
            "ConnectionError caught", "Timeout caught", "No error", "HTTPError caught",
            "A", "An unreachable host causes a ConnectionError.",
            "import requests\ntry:\n    requests.get('http://192.0.2.1:12345', timeout=1)\n    print('No error')\nexcept requests.exceptions.ConnectionError:\n    print('ConnectionError caught')\nexcept requests.exceptions.Timeout:\n    print('Timeout caught')")),

        (_q(0, "Timeout Handling", "Medium", "output",
            "What will be printed?",
            "(5, 30)", "5", "30", "35",
            "A", "A tuple timeout is preserved and printed as the tuple.",
            "import requests\ntimeout = (5, 30)\nprint(timeout)")),

        (_q(0, "Retry Mechanism", "Hard", "output",
            "What will be printed?",
            "200", "ConnectionError", "MaxRetryError", "Timeout",
            "A", "The retry mechanism retries on 500 errors and eventually gets a 200.",
            "import requests\nfrom requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\n\ns = requests.Session()\nretry = Retry(total=3, status_forcelist=[500])\ns.mount('https://', HTTPAdapter(max_retries=retry))\nr = s.get('https://httpbin.org/get')\nprint(r.status_code)\ns.close()")),

        (_q(0, "File Upload", "Medium", "output",
            "Will the request Content-Type contain 'multipart'?",
            "True", "False", "Error", "None",
            "A", "Using the files parameter sets multipart/form-data Content-Type.",
            "import requests\nimport io\nf = io.BytesIO(b'test content')\nr = requests.post('https://httpbin.org/post', files={'file': ('test.txt', f)})\nprint('multipart' in r.request.headers.get('Content-Type', ''))")),

        (_q(0, "Redirects", "Hard", "output",
            "What will be printed?",
            "3", "0", "1", "Error",
            "A", "3 redirects occur before reaching the final destination.",
            "import requests\nr = requests.get('https://httpbin.org/redirect/3')\nprint(len(r.history))")),

        (_q(0, "Mock Testing with responses", "Medium", "output",
            "What will be printed?",
            "404", "200", "ConnectionError", "Error",
            "A", "The mocked response returns status 404.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'https://api.example.com/missing',\n                  json={'error': 'not found'}, status=404)\n    r = requests.get('https://api.example.com/missing')\n    print(r.status_code)\n\ntest()")),

        (_q(0, "POST Requests", "Easy", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "httpbin echoes the form data in the 'form' key.",
            "import requests\nr = requests.post('https://httpbin.org/post', data={'key': 'value'})\nprint('key' in r.json()['form'])")),

        (_q(0, "Authentication - Basic", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "httpbin confirms authentication with authenticated=True.",
            "import requests\nfrom requests.auth import HTTPBasicAuth\nr = requests.get('https://httpbin.org/basic-auth/admin/secret',\n                 auth=HTTPBasicAuth('admin', 'secret'))\nprint(r.json()['authenticated'])")),

        (_q(0, "GET Requests", "Easy", "output",
            "What will be printed?",
            "https://httpbin.org/get", "httpbin.org/get", "GET", "None",
            "A", "response.url shows the final URL of the request.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.url)")),

        (_q(0, "Response Handling", "Medium", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The encoding attribute is not None for text responses.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.encoding is not None)")),

        (_q(0, "Session Management", "Hard", "output",
            "What will be printed?",
            "admin", "None", "Error", "KeyError",
            "A", "Basic auth on the session is used for all requests.",
            "import requests\ns = requests.Session()\ns.auth = ('admin', 'secret')\nr = s.get('https://httpbin.org/basic-auth/admin/secret')\nprint(r.json()['user'])\ns.close()")),

        (_q(0, "Error Handling", "Hard", "output",
            "What will be printed?",
            "TooManyRedirects", "ConnectionError", "HTTPError", "No error",
            "A", "Exceeding the redirect limit raises TooManyRedirects.",
            "import requests\ntry:\n    requests.get('https://httpbin.org/redirect/31', allow_redirects=True)\nexcept requests.exceptions.TooManyRedirects:\n    print('TooManyRedirects')\nexcept Exception as e:\n    print(type(e).__name__)")),

        (_q(0, "Headers", "Medium", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "response.request.headers contains the headers that were actually sent.",
            "import requests\nr = requests.get('https://httpbin.org/get', headers={'Accept': 'application/json'})\nprint('Accept' in r.request.headers)")),

        (_q(0, "Query Parameters", "Hard", "output",
            "What will be printed?",
            "https://httpbin.org/get?existing=1&new=2", "https://httpbin.org/get?new=2", "https://httpbin.org/get?existing=1", "Error",
            "A", "params are appended to the existing query string.",
            "import requests\nr = requests.get('https://httpbin.org/get?existing=1', params={'new': '2'})\nprint(r.url)")),

        (_q(0, "Cookies", "Medium", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The cookie is sent and echoed back by httpbin.",
            "import requests\nr = requests.get('https://httpbin.org/cookies', cookies={'token': 'abc'})\nprint('token' in r.json()['cookies'])")),

        (_q(0, "Streaming Responses", "Easy", "output",
            "What will be printed?",
            "False", "True", "None", "Error",
            "A", "With stream=True, the content is not immediately downloaded.",
            "import requests\nr = requests.get('https://httpbin.org/bytes/1024', stream=True)\nprint(r._content_consumed)\nr.close()")),

        (_q(0, "PUT Requests", "Medium", "output",
            "What will be in the response json field?",
            "{'updated': True}", "None", "Error", "{}",
            "A", "httpbin echoes the JSON body in the 'json' field.",
            "import requests\nr = requests.put('https://httpbin.org/put', json={'updated': True})\nprint(r.json()['json'])")),

        (_q(0, "DELETE Requests", "Medium", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "httpbin echoes the JSON body even for DELETE requests.",
            "import requests\nr = requests.delete('https://httpbin.org/delete', json={'id': 42})\nprint(r.json()['json'] == {'id': 42})")),

        (_q(0, "PATCH Requests", "Medium", "output",
            "What will be in the response json field?",
            "{'field': 'patched'}", "None", "Error", "{}",
            "A", "httpbin echoes the JSON body for PATCH requests.",
            "import requests\nr = requests.patch('https://httpbin.org/patch', json={'field': 'patched'})\nprint(r.json()['json'])")),

        (_q(0, "File Upload", "Hard", "output",
            "What will be printed?",
            "test.txt", "file", "Error", "None",
            "A", "httpbin echoes uploaded file info in the 'files' key.",
            "import requests\nimport io\nbuf = io.BytesIO(b'file content')\nr = requests.post('https://httpbin.org/post',\n                  files={'upload': ('test.txt', buf, 'text/plain')})\nprint(list(r.json()['files'].keys())[0])")),

        (_q(0, "Mock Testing with responses", "Hard", "output",
            "What will be printed?",
            "https://api.example.com/data", "None", "Error", "[]",
            "A", "responses.calls[0].request.url stores the URL of the first call.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'https://api.example.com/data', json={}, status=200)\n    requests.get('https://api.example.com/data')\n    print(responses.calls[0].request.url)\n\ntest()")),

        (_q(0, "Authentication - OAuth", "Hard", "output",
            "What will be printed?",
            "Bearer test_token", "test_token", "None", "Error",
            "A", "The Authorization header contains the Bearer token.",
            "import requests\nheaders = {'Authorization': 'Bearer test_token'}\nr = requests.get('https://httpbin.org/get', headers=headers)\nprint(r.json()['headers']['Authorization'])")),

        (_q(0, "Retry Mechanism", "Medium", "output",
            "What type is the adapter?",
            "<class 'requests.adapters.HTTPAdapter'>", "<class 'requests.Session'>", "<class 'urllib3.HTTPAdapter'>", "Error",
            "A", "HTTPAdapter is from requests.adapters.",
            "from requests.adapters import HTTPAdapter\nadapter = HTTPAdapter(max_retries=3)\nprint(type(adapter))")),

        (_q(0, "SSL Verification", "Easy", "output",
            "What will be printed?",
            "True", "False", "None", "Error",
            "A", "With default settings (verify=True), the request to a valid HTTPS site succeeds.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.ok)")),

        (_q(0, "Response Handling", "Easy", "output",
            "What will be printed?",
            "Not Found", "404", "Error", "None",
            "A", "response.reason gives the textual reason for a 404.",
            "import requests\nr = requests.get('https://httpbin.org/status/404')\nprint(r.reason)")),

        (_q(0, "GET Requests", "Medium", "output",
            "What will be printed?",
            "GET", "POST", "None", "Error",
            "A", "response.request.method shows the HTTP method that was used.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.request.method)")),

        (_q(0, "POST Requests", "Medium", "output",
            "What will be printed?",
            "POST", "GET", "None", "Error",
            "A", "The request method is POST.",
            "import requests\nr = requests.post('https://httpbin.org/post', json={})\nprint(r.request.method)")),

        (_q(0, "Headers", "Easy", "output",
            "What type is response.headers?",
            "CaseInsensitiveDict", "dict", "list", "OrderedDict",
            "A", "requests uses CaseInsensitiveDict for response headers.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(type(r.headers).__name__)")),

        (_q(0, "Error Handling", "Medium", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "RequestException is the parent of all requests exceptions.",
            "import requests\nprint(issubclass(requests.exceptions.Timeout, requests.exceptions.RequestException))")),

        (_q(0, "Response Handling", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The response object's bool value is True for 2xx status codes.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(bool(r))")),

        (_q(0, "Response Handling", "Hard", "output",
            "What will be printed?",
            "False", "True", "Error", "None",
            "A", "A 500 status makes the Response falsy.",
            "import requests\nr = requests.get('https://httpbin.org/status/500')\nprint(bool(r))")),

        (_q(0, "Cookies", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "Session persists cookies set by the server.",
            "import requests\ns = requests.Session()\ns.get('https://httpbin.org/cookies/set/lang/python')\nr = s.get('https://httpbin.org/cookies')\nprint(r.json()['cookies']['lang'] == 'python')\ns.close()")),

        (_q(0, "Timeout Handling", "Hard", "output",
            "What will be printed?",
            "ConnectTimeout", "ReadTimeout", "Timeout", "ConnectionError",
            "A", "A very short connect timeout triggers ConnectTimeout specifically.",
            "import requests\ntry:\n    requests.get('https://httpbin.org/get', timeout=(0.0001, 30))\nexcept requests.exceptions.ConnectTimeout:\n    print('ConnectTimeout')\nexcept requests.exceptions.Timeout:\n    print('Timeout')\nexcept Exception as e:\n    print(type(e).__name__)")),

        (_q(0, "Query Parameters", "Medium", "output",
            "What will be printed?",
            "https://httpbin.org/get?a=1&b=2", "https://httpbin.org/get", "Error", "None",
            "A", "Params from a list of tuples are encoded just like a dict.",
            "import requests\nr = requests.get('https://httpbin.org/get', params=[('a', '1'), ('b', '2')])\nprint(r.url)")),

        (_q(0, "Request Body", "Easy", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The form data is echoed in the response.",
            "import requests\nr = requests.post('https://httpbin.org/post', data={'username': 'admin'})\nprint(r.json()['form']['username'] == 'admin')")),

        (_q(0, "Mock Testing with responses", "Easy", "output",
            "What will be printed?",
            "hello world", "None", "Error", "ConnectionError",
            "A", "The mocked response returns the specified JSON body.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'http://test.com/api',\n                  json={'msg': 'hello world'}, status=200)\n    r = requests.get('http://test.com/api')\n    print(r.json()['msg'])\n\ntest()")),

        (_q(0, "Redirects", "Easy", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "After following a redirect, the final status is 200 so ok is True.",
            "import requests\nr = requests.get('https://httpbin.org/redirect/1')\nprint(r.ok)")),

        (_q(0, "Authentication - Basic", "Easy", "output",
            "What will be printed?",
            "True", "False", "None", "Error",
            "A", "The Authorization header is present when using auth=.",
            "import requests\nr = requests.get('https://httpbin.org/get', auth=('user', 'pass'))\nprint('Authorization' in r.request.headers)")),

        (_q(0, "Session Management", "Easy", "output",
            "What will be printed?",
            "200", "None", "Error", "Session",
            "A", "A session GET request works like a regular GET request.",
            "import requests\ns = requests.Session()\nr = s.get('https://httpbin.org/get')\nprint(r.status_code)\ns.close()")),

        (_q(0, "Response Handling", "Medium", "output",
            "What will be printed?",
            "utf-8", "ascii", "None", "latin-1",
            "A", "httpbin returns JSON with utf-8 encoding.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(r.encoding)")),

        (_q(0, "GET Requests", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The request object is a PreparedRequest accessible from the response.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint(hasattr(r.request, 'headers'))")),

        (_q(0, "POST Requests", "Hard", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The response body contains the echoed request data.",
            "import requests\nr = requests.post('https://httpbin.org/post', json={'a': 1})\nprint(r.json()['json']['a'] == 1)")),

        (_q(0, "Headers", "Hard", "output",
            "What will be printed?",
            "True", "False", "KeyError", "None",
            "A", "Response headers always contain a Date header from the server.",
            "import requests\nr = requests.get('https://httpbin.org/get')\nprint('Date' in r.headers or 'date' in r.headers)")),

        (_q(0, "Error Handling", "Hard", "output",
            "What will be printed?",
            "InvalidURL", "MissingSchema", "ConnectionError", "ValueError",
            "A", "An empty URL is caught as InvalidURL or MissingSchema.",
            "import requests\ntry:\n    requests.get('')\nexcept requests.exceptions.MissingSchema:\n    print('MissingSchema')\nexcept requests.exceptions.InvalidURL:\n    print('InvalidURL')")),

        (_q(0, "Cookies", "Easy", "output",
            "What will be printed?",
            "True", "False", "Error", "None",
            "A", "The cookies dict sends the specified cookie with the request.",
            "import requests\nr = requests.get('https://httpbin.org/cookies', cookies={'lang': 'en'})\nprint('lang' in r.json()['cookies'])")),

        (_q(0, "PUT Requests", "Hard", "output",
            "What will be printed?",
            "PUT", "POST", "GET", "Error",
            "A", "The request method for a put() call is PUT.",
            "import requests\nr = requests.put('https://httpbin.org/put', json={})\nprint(r.request.method)")),

        (_q(0, "PATCH Requests", "Hard", "output",
            "What will be printed?",
            "PATCH", "PUT", "POST", "Error",
            "A", "The request method for a patch() call is PATCH.",
            "import requests\nr = requests.patch('https://httpbin.org/patch', json={})\nprint(r.request.method)")),
    ]

    for oq in output_questions:
        qid += 1
        oq["id"] = qid
        questions.append(oq)

    # ===================================================================
    # SCENARIO questions (100) -- code_snippet is empty string
    # ===================================================================

    scenario_questions_data = [
        ("GET Requests", "Easy", "You need to fetch the latest weather data from an API endpoint. Which approach is correct?",
         "requests.get('https://api.weather.com/current')", "requests.post('https://api.weather.com/current')", "requests.fetch('https://api.weather.com/current')", "requests.download('https://api.weather.com/current')",
         "A", "GET is the correct method for retrieving/fetching data from an API."),

        ("POST Requests", "Easy", "You need to submit a registration form to a server. Which method should you use?",
         "requests.post(url, data=form_data)", "requests.get(url, data=form_data)", "requests.put(url, data=form_data)", "requests.send(url, data=form_data)",
         "A", "POST is used to submit data (like form submissions) to a server."),

        ("PUT Requests", "Medium", "A REST API requires you to completely replace a user profile. Which HTTP method is most appropriate?",
         "PUT", "PATCH", "POST", "DELETE",
         "A", "PUT replaces the entire resource, making it appropriate for complete updates."),

        ("DELETE Requests", "Easy", "You need to remove a user account via a REST API. Which method should you use?",
         "requests.delete(url)", "requests.remove(url)", "requests.post(url, action='delete')", "requests.get(url, method='DELETE')",
         "A", "DELETE is the standard HTTP method for removing resources."),

        ("PATCH Requests", "Medium", "A user wants to update only their email address. Which HTTP method is most appropriate?",
         "PATCH", "PUT", "POST", "GET",
         "A", "PATCH is designed for partial updates to a resource."),

        ("Headers", "Medium", "An API requires an API key in a custom header 'X-API-Key'. How should you send it?",
         "requests.get(url, headers={'X-API-Key': 'your_key'})", "requests.get(url, api_key='your_key')", "requests.get(url, params={'X-API-Key': 'your_key'})", "requests.get(url, auth=('X-API-Key', 'your_key'))",
         "A", "Custom headers are sent via the headers parameter as a dictionary."),

        ("Query Parameters", "Easy", "You need to search an API with keywords and page number. How should you send these parameters?",
         "requests.get(url, params={'q': 'python', 'page': 1})", "requests.get(url + '?q=python?page=1')", "requests.get(url, query={'q': 'python', 'page': 1})", "requests.get(url, search='python', page=1)",
         "A", "The params keyword argument properly encodes and appends query parameters."),

        ("Request Body", "Medium", "You need to send a JSON payload to an API that expects Content-Type: application/json. What is the best approach?",
         "requests.post(url, json=payload)", "requests.post(url, data=payload)", "requests.post(url, body=json.dumps(payload))", "requests.post(url, data=json.dumps(payload))",
         "A", "The json parameter automatically serialises and sets the correct Content-Type."),

        ("Response Handling", "Easy", "You receive a response from an API and need to parse the JSON body. What is the simplest approach?",
         "response.json()", "json.loads(response.text)", "json.parse(response.content)", "response.parse_json()",
         "A", "response.json() is the built-in method for parsing JSON responses."),

        ("Response Handling", "Medium", "You want to ensure your code raises an error for any non-successful HTTP response. What should you use?",
         "response.raise_for_status()", "if response.status_code != 200: raise Exception()", "assert response.ok", "response.check()",
         "A", "raise_for_status() raises HTTPError for 4xx and 5xx status codes."),

        ("Authentication - Basic", "Easy", "A legacy API uses HTTP Basic Authentication. How do you authenticate?",
         "requests.get(url, auth=('username', 'password'))", "requests.get(url, headers={'username': 'password'})", "requests.get(url, login='username:password')", "requests.get(url, basic_auth=True)",
         "A", "A tuple passed to auth uses Basic authentication by default."),

        ("Authentication - Bearer Token", "Medium", "An OAuth2 API gives you an access token. How do you use it in subsequent requests?",
         "headers={'Authorization': 'Bearer ' + token}", "auth=('Bearer', token)", "params={'token': token}", "cookies={'auth': token}",
         "A", "Bearer tokens are sent in the Authorization header with 'Bearer ' prefix."),

        ("Authentication - OAuth", "Hard", "You need to implement OAuth1 authentication for a Twitter-like API. What library should you use with requests?",
         "requests-oauthlib", "python-oauth2", "oauthlib", "requests-auth",
         "A", "requests-oauthlib provides seamless OAuth1/2 integration with the requests library."),

        ("Session Management", "Medium", "You need to make multiple authenticated API calls with the same headers and cookies. What is the best approach?",
         "Use a requests.Session() to persist settings across requests", "Set headers on each individual request", "Create a new connection for each request", "Store cookies in a global variable",
         "A", "Sessions persist headers, cookies, and auth across multiple requests efficiently."),

        ("Session Management", "Hard", "You need to make hundreds of API calls to the same server efficiently. What approach minimises connection overhead?",
         "Use a Session to reuse TCP connections via connection pooling", "Use multiprocessing with individual requests", "Set keep-alive headers manually", "Use async IO with aiohttp only",
         "A", "Sessions reuse TCP connections via urllib3 connection pooling, reducing overhead."),

        ("Timeout Handling", "Easy", "Your script hangs when a server is unresponsive. How do you prevent this?",
         "Add a timeout parameter to the request", "Use a separate thread with a timer", "Set a global socket timeout", "Close the connection manually",
         "A", "The timeout parameter ensures requests doesn't wait indefinitely."),

        ("Timeout Handling", "Medium", "You need a 5-second connect timeout but a 30-second read timeout for large downloads. How do you configure this?",
         "requests.get(url, timeout=(5, 30))", "requests.get(url, connect_timeout=5, read_timeout=30)", "requests.get(url, timeout=5, read_limit=30)", "requests.get(url, timeout={'connect': 5, 'read': 30})",
         "A", "A tuple of (connect_timeout, read_timeout) sets them independently."),

        ("Retry Mechanism", "Medium", "Your API client needs to retry on 500 and 502 errors up to 3 times. How do you implement this?",
         "Use HTTPAdapter with Retry(total=3, status_forcelist=[500, 502])", "Use a try/except loop with 3 iterations", "Set requests.max_retries = 3", "Use session.retry(total=3)",
         "A", "HTTPAdapter with Retry provides configurable automatic retry logic."),

        ("Retry Mechanism", "Hard", "You need exponential backoff between retries. How do you configure this?",
         "Set backoff_factor in the Retry object", "Use time.sleep() between manual retries", "Set retry_delay on HTTPAdapter", "Use a third-party retry library",
         "A", "Retry(backoff_factor=0.5) adds exponential delays between retry attempts."),

        ("SSL Verification", "Easy", "You are testing against a local server with a self-signed certificate. How do you handle the SSL error?",
         "Use verify=False (development only) or provide the self-signed cert to verify", "Remove the https:// from the URL", "Install a real certificate", "Downgrade to HTTP",
         "A", "verify=False bypasses SSL verification; for production, provide the custom cert."),

        ("SSL Verification", "Hard", "Your company uses a private CA. How do you make requests trust certificates signed by this CA?",
         "Pass the CA bundle path to the verify parameter", "Set verify=False globally", "Install the CA cert in the system store only", "Use a custom SSL context",
         "A", "verify='/path/to/company-ca-bundle.crt' adds trust for the private CA."),

        ("Streaming Responses", "Medium", "You need to download a 2GB file without loading it all into memory. How should you approach this?",
         "Use stream=True and iter_content() to write chunks to disk", "Use response.content and write it all at once", "Use response.text to save the file", "Use requests.download(url)",
         "A", "Streaming with chunked iteration prevents loading the entire file into memory."),

        ("Streaming Responses", "Hard", "You are consuming a server-sent events (SSE) stream. How do you read events line by line?",
         "Use stream=True and response.iter_lines()", "Use response.text.split('\\n')", "Use response.readlines()", "Use response.events()",
         "A", "iter_lines() yields lines from a streaming response, ideal for SSE."),

        ("File Upload", "Easy", "You need to upload a profile picture to an API. How do you send the file?",
         "requests.post(url, files={'avatar': open('photo.jpg', 'rb')})", "requests.post(url, data=open('photo.jpg', 'rb'))", "requests.upload(url, 'photo.jpg')", "requests.post(url, file='photo.jpg')",
         "A", "The files parameter handles multipart file uploads correctly."),

        ("File Upload", "Medium", "You need to upload a file along with additional form fields. How do you accomplish this?",
         "Use both files and data parameters in requests.post()", "Combine file and form data in the files parameter", "Send two separate requests", "Use json parameter for both",
         "A", "files and data can be used together for multipart uploads with additional form fields."),

        ("File Upload", "Hard", "You need to upload a large file without loading it all into memory. What approach should you use?",
         "Open the file in binary mode and pass it to data for streaming upload", "Read the entire file into memory first", "Encode it as base64 in JSON", "Split it into multiple requests",
         "A", "Passing an open file object to data streams it without loading everything into memory."),

        ("Cookies", "Easy", "An API sets a session cookie on login. How do you ensure it is sent with subsequent requests?",
         "Use a requests.Session() which automatically manages cookies", "Manually copy cookies between requests", "Set cookies in the headers dict", "Use a cookie file",
         "A", "Sessions automatically store and send cookies across requests."),

        ("Cookies", "Medium", "You need to send a specific cookie with a single request without a session. How do you do it?",
         "requests.get(url, cookies={'session_id': 'abc123'})", "requests.get(url, headers={'cookie': 'abc123'})", "requests.get(url, cookie='session_id=abc123')", "requests.get(url, jar={'session_id': 'abc123'})",
         "A", "The cookies parameter accepts a dict of cookie name-value pairs."),

        ("Cookies", "Hard", "You need to load cookies from a Netscape-format cookie file for use with requests. What approach works?",
         "Use http.cookiejar.MozillaCookieJar and pass it to the cookies parameter or session", "Use requests.load_cookies('file')", "Parse the file manually and set headers", "Cookies from files are not supported",
         "A", "MozillaCookieJar can load Netscape cookies and is compatible with requests."),

        ("Redirects", "Easy", "You want to know the final URL after an API redirect. How do you find it?",
         "Check response.url after the request completes", "Check response.redirect_url", "Check response.headers['Location']", "Parse the HTML for the redirect",
         "A", "response.url contains the final URL after all redirects."),

        ("Redirects", "Medium", "You need to inspect where a URL redirects without following the redirect. How do you do this?",
         "Set allow_redirects=False and check the Location header", "Parse the HTML response", "Use response.redirect_url", "Use requests.head(url)",
         "A", "allow_redirects=False returns the redirect response with the Location header."),

        ("Redirects", "Hard", "A login API uses a 302 redirect after authentication, but your POST data is lost. Why?",
         "302 redirects convert POST to GET, losing the body", "The server rejected the data", "Cookies were not sent", "The timeout expired",
         "A", "302 redirect causes a POST-to-GET conversion, which drops the request body."),

        ("Error Handling", "Easy", "Your code should handle network errors gracefully. Which exception should you catch?",
         "requests.exceptions.ConnectionError", "ConnectionRefusedError", "socket.error", "OSError",
         "A", "ConnectionError covers network-related failures in the requests library."),

        ("Error Handling", "Medium", "You want to handle any possible error from the requests library. What exception should you catch?",
         "requests.exceptions.RequestException", "Exception", "requests.exceptions.HTTPError", "requests.exceptions.ConnectionError",
         "A", "RequestException is the base class for all requests exceptions."),

        ("Error Handling", "Hard", "An API sometimes returns 429 Too Many Requests. How should you handle this with retry logic?",
         "Use Retry with status_forcelist=[429] and respect the Retry-After header", "Catch HTTPError and sleep for a fixed time", "Ignore the error and retry immediately", "Switch to a different API",
         "A", "Retry with status_forcelist=[429] and backoff_factor automatically handles rate limiting."),

        ("Mock Testing with responses", "Easy", "You need to test code that calls an external API without making real HTTP requests. What approach should you use?",
         "Use the responses library to mock the requests", "Comment out the API calls", "Use a staging server", "Mock the entire requests module with unittest.mock",
         "A", "The responses library provides simple and effective mocking for requests calls."),

        ("Mock Testing with responses", "Medium", "You need to test that your code properly handles a 500 server error. How do you simulate it?",
         "Use responses.add() with status=500", "Make the real server return 500", "Raise an exception manually", "Use unittest.mock to patch the status code",
         "A", "responses.add() can simulate any status code for testing error handling."),

        ("Mock Testing with responses", "Hard", "You need to test retry logic by having the first request fail and the second succeed. How do you set this up?",
         "Add two responses: first with status=500, second with status=200", "Use a callback function that counts calls", "This is not possible with the responses library", "Use a custom mock server",
         "A", "responses.add() can be called multiple times for the same URL; they are returned in order."),

        ("GET Requests", "Medium", "You need to download data from an API that requires both an API key header and query parameters. How do you structure the request?",
         "requests.get(url, headers={'X-API-Key': key}, params={'q': 'search'})", "requests.get(url + '?q=search', api_key=key)", "requests.get(url, key=key, query='search')", "requests.get(url, auth=key, params='q=search')",
         "A", "Headers and params are separate keyword arguments that can be combined."),

        ("POST Requests", "Medium", "An API endpoint accepts both JSON data and file uploads in the same request. What is the best approach?",
         "Send files via the files parameter and additional data via the data parameter", "Use json parameter with base64-encoded file", "Make two separate requests", "Combine everything in the json parameter",
         "A", "files and data parameters can be combined for multipart requests with mixed content."),

        ("Response Handling", "Hard", "You receive a response with encoding issues - the text shows garbled characters. How do you fix this?",
         "Set response.encoding to the correct encoding before accessing response.text", "Use response.content.decode('utf-8')", "Use response.raw to get unprocessed data", "Re-send the request with Accept-Charset header",
         "A", "Setting response.encoding before accessing .text fixes encoding issues."),

        ("Headers", "Hard", "An API uses ETags for caching. How do you implement conditional requests?",
         "Send the ETag in the If-None-Match header and check for 304 status", "Cache the response locally and check timestamps", "Use the Expires header only", "Set Cache-Control: no-cache",
         "A", "Sending If-None-Match with the ETag allows 304 Not Modified responses for caching."),

        ("Session Management", "Medium", "You need different authentication for different API hosts in the same application. How do you handle this?",
         "Create separate Session objects for each host", "Use a single session and change auth before each request", "Set auth in headers instead", "Use a global auth variable",
         "A", "Separate sessions keep authentication and settings isolated per host."),

        ("Timeout Handling", "Hard", "You need to limit the total time spent on a request including retries. How do you implement this?",
         "Use a combination of per-request timeout and a total timer with a deadline", "Set timeout to the total time divided by retry count", "Use only the timeout parameter", "Use asyncio timeout",
         "A", "Combine per-request timeout with an external deadline timer to limit total time."),

        ("Retry Mechanism", "Hard", "Your retry strategy should only retry on GET and HEAD methods, not POST. How do you configure this?",
         "Set allowed_methods=['GET', 'HEAD'] in the Retry object", "Filter methods in a try/except loop", "Use separate adapters for different methods", "Use method_whitelist=['GET', 'HEAD']",
         "A", "allowed_methods in the Retry object restricts which HTTP methods are retried."),

        ("SSL Verification", "Medium", "You need to verify the server certificate but also send a client certificate. How do you configure both?",
         "Use verify=True (or path to CA) and cert=('/path/client.cert', '/path/client.key')", "Use verify='/path/client.cert'", "Set both in the headers", "Use SSL context only",
         "A", "verify handles server cert validation; cert provides client certificate authentication."),

        ("Streaming Responses", "Medium", "You are processing a large JSON Lines file from an API. How do you efficiently process each line?",
         "Use stream=True and response.iter_lines() to process each JSON line", "Download the entire file then split by newlines", "Use response.json() which handles JSON Lines", "Use json.loads(response.text)",
         "A", "iter_lines() with stream=True processes each line without loading the entire response."),

        ("Redirects", "Hard", "A POST request to an API returns 307 Temporary Redirect. How does requests handle this differently from 302?",
         "307 preserves the HTTP method and body; the POST is repeated to the new URL", "307 and 302 are handled the same way", "307 converts POST to GET like 302", "307 is not supported by requests",
         "A", "307 preserves the method and body, unlike 302 which converts POST to GET."),

        ("Error Handling", "Hard", "You need to distinguish between a server being down (ConnectionError) and the server responding with an error (HTTPError). How do you structure your error handling?",
         "Use separate except blocks for ConnectionError and HTTPError", "Catch RequestException and check the type", "Check response.status_code only", "Use response.ok only",
         "A", "Separate except blocks allow different handling for network vs server errors."),

        ("Mock Testing with responses", "Hard", "You need to test code that uses a Session with retry logic. How do you mock the responses?",
         "The responses library intercepts at the transport level, so sessions and retries work normally with mocked responses", "You must mock the Session class directly", "responses does not work with Sessions", "Use unittest.mock instead",
         "A", "responses intercepts HTTP calls regardless of whether sessions or retries are used."),

        ("Request Body", "Hard", "You need to send a binary protobuf payload in a POST request. How do you do this?",
         "Pass the serialised bytes to data and set Content-Type header to application/protobuf", "Use the json parameter with the protobuf", "Use the files parameter", "Use the proto parameter",
         "A", "Binary data is sent via data parameter with the appropriate Content-Type header."),

        ("Authentication - Bearer Token", "Hard", "Your access token expires after 1 hour. How do you implement automatic token refresh in requests?",
         "Create a custom auth class extending AuthBase that refreshes the token when needed", "Check token expiry before each request manually", "Use a global variable for the token", "Set a timeout of 1 hour",
         "A", "A custom AuthBase subclass can intercept requests and refresh tokens automatically."),

        ("Authentication - OAuth", "Hard", "You need to implement the OAuth2 client credentials flow for machine-to-machine authentication. What approach works?",
         "POST to the token endpoint with client_id and client_secret, then use the returned token", "Use Basic Auth with client credentials", "Use requests-oauthlib with user authorization", "Pass credentials as query parameters",
         "A", "Client credentials flow involves POSTing to the token endpoint to get an access token."),

        ("Session Management", "Hard", "You need to log and inspect all HTTP requests and responses made through a session. How do you implement this?",
         "Mount a custom adapter or use the built-in logging with urllib3 debug logging", "Override session.get()", "Use a global request hook", "This is not possible with requests",
         "A", "Custom adapters or event hooks can intercept and log all requests and responses."),

        ("File Upload", "Hard", "An API requires a multipart upload with a specific boundary string. How do you control this?",
         "Prepare the request manually using PreparedRequest and set the Content-Type with the custom boundary", "Use the boundary parameter in files", "Set boundary in headers", "The boundary is always random",
         "A", "PreparedRequest allows full control over the multipart boundary."),

        ("Cookies", "Hard", "You need to share cookies between a requests Session and a Selenium WebDriver. How do you transfer cookies?",
         "Extract cookies from Selenium and set them on the Session using session.cookies.update()", "Export to a file and import in the other", "Cookies are incompatible between the two", "Use a shared cookie jar",
         "A", "Session cookies can be updated with cookies extracted from Selenium's driver.get_cookies()."),

        ("GET Requests", "Hard", "You need to make a conditional GET request that only downloads data if it has changed since your last request. How do you implement this?",
         "Use If-Modified-Since or If-None-Match headers and check for 304 response", "Compare response.text with cached data", "Use a hash of the response body", "Set cache=True in the request",
         "A", "Conditional headers enable efficient caching with 304 Not Modified responses."),

        ("POST Requests", "Hard", "You need to send a request with chunked transfer encoding. How do you achieve this?",
         "Pass a generator to the data parameter", "Set headers={'Transfer-Encoding': 'chunked'}", "Use stream=True", "Set chunked=True in the request",
         "A", "Generators passed to data trigger chunked transfer encoding automatically."),

        ("Error Handling", "Medium", "Your code needs to retry on ConnectionError but not on HTTPError. How do you structure this?",
         "Use separate except clauses and only retry in the ConnectionError handler", "Catch RequestException and retry for all errors", "Use raise_for_status() in the retry loop", "Retry on all exceptions",
         "A", "Separate exception handling allows selective retry logic for specific error types."),

        ("Timeout Handling", "Medium", "You are making requests to multiple APIs with different timeout requirements. How do you manage this?",
         "Set different timeout values per request or use different Session objects", "Set a global timeout for all requests", "Use the longest timeout for all requests", "Timeouts cannot vary between requests",
         "A", "Each request can have its own timeout parameter for fine-grained control."),

        ("Retry Mechanism", "Medium", "You want retries to use exponential backoff starting at 1 second. What backoff_factor should you use?",
         "backoff_factor=1", "backoff_factor=0.5", "backoff_factor=2", "backoff_factor=0.1",
         "A", "backoff_factor=1 gives delays of 1s, 2s, 4s... between retries."),

        ("SSL Verification", "Hard", "Your application runs in a Docker container and needs to trust the host's CA certificates. How do you handle this?",
         "Mount the host CA bundle into the container and point requests to it via verify or REQUESTS_CA_BUNDLE", "Set verify=False in all requests", "Install certifi inside the container only", "Use the system certificate store automatically",
         "A", "Mounting the host CA bundle and configuring requests to use it is the proper approach."),

        ("Streaming Responses", "Hard", "You need to process a streaming response that sends data indefinitely (like a Twitter firehose). How do you handle connection drops?",
         "Use iter_lines() in a loop with reconnection logic and timeout", "Use response.text which buffers everything", "Set a very large timeout", "Use WebSockets instead",
         "A", "iter_lines() with reconnection logic handles long-lived streams with potential drops."),

        ("Mock Testing with responses", "Medium", "You need to verify that your code sends the correct request headers when calling an API. How do you check this?",
         "Use responses.calls[0].request.headers to inspect sent headers", "Print the headers in the production code", "Use a proxy to inspect traffic", "Check response.request.headers",
         "A", "responses.calls records all requests including their headers for inspection."),

        ("Headers", "Medium", "You need to send a request that accepts both JSON and XML responses, preferring JSON. How do you set the Accept header?",
         "headers={'Accept': 'application/json, application/xml;q=0.9'}", "headers={'Accept': 'json,xml'}", "headers={'Accept': 'application/json'} only", "params={'accept': 'json,xml'}",
         "A", "Quality values (q=) in Accept header express preference for different content types."),

        ("Query Parameters", "Medium", "You need to send a query parameter with special characters like spaces and ampersands. How should you handle this?",
         "Use the params dict and requests will URL-encode automatically", "Manually encode with urllib.parse.quote", "Replace spaces with + manually", "Use raw strings in the URL",
         "A", "The params parameter handles URL encoding of special characters automatically."),

        ("Request Body", "Medium", "An API accepts both form data and JSON. You need to send nested data. Which approach is better?",
         "Use json= for nested data structures", "Use data= for nested data structures", "Use data= with manual flattening", "Send nested data as query parameters",
         "A", "JSON naturally supports nested structures; form encoding does not."),

        ("Response Handling", "Medium", "You need to save a binary response (like a PDF) to disk. What is the correct approach?",
         "Write response.content to a file opened in binary mode", "Write response.text to a file", "Use response.save('file.pdf')", "Use json.dumps(response.content)",
         "A", "response.content provides the raw bytes suitable for binary files."),

        ("Authentication - Basic", "Hard", "You need to use Digest authentication instead of Basic. How do you implement this?",
         "Use requests.auth.HTTPDigestAuth(user, pass)", "Use auth=('user', 'pass', 'digest')", "Set headers manually with the digest hash", "Digest auth is not supported",
         "A", "HTTPDigestAuth from requests.auth provides HTTP Digest Authentication."),

        ("Session Management", "Easy", "You need to make API calls that require login first. What is the best approach?",
         "Use a Session, login first, then make subsequent requests (cookies persist)", "Login and copy the cookie manually to each request", "Include credentials in every request", "Use a global cookie variable",
         "A", "Sessions automatically persist login cookies for subsequent requests."),

        ("File Upload", "Medium", "You need to upload a CSV file with specific MIME type 'text/csv'. How do you specify this?",
         "files={'file': ('data.csv', open('data.csv', 'rb'), 'text/csv')}", "files={'file': open('data.csv', 'rb'), 'type': 'text/csv'}", "files={'file': open('data.csv')}, content_type='text/csv'", "headers={'Content-Type': 'text/csv'}, data=open('data.csv')",
         "A", "A tuple with (filename, file_object, content_type) sets the MIME type per file."),

        ("Cookies", "Medium", "After login, you want to inspect what cookies the server set. How do you do this?",
         "Check response.cookies or session.cookies", "Check response.headers['Set-Cookie'] manually", "Parse the response body for cookies", "Use browser developer tools",
         "A", "response.cookies provides easy access to cookies set by the server."),

        ("Redirects", "Medium", "You want to track all redirect URLs in a chain. How do you get this information?",
         "Iterate over response.history and check each response's url attribute", "Parse the Location headers manually", "Use response.redirect_chain", "Enable verbose logging",
         "A", "response.history contains Response objects for each redirect, with url attributes."),

        ("Error Handling", "Easy", "Your script crashes when the internet connection drops. How do you make it more robust?",
         "Wrap requests calls in try/except for ConnectionError", "Use a faster internet connection", "Set verify=False", "Increase the timeout",
         "A", "Catching ConnectionError prevents crashes due to network issues."),

        ("Mock Testing with responses", "Easy", "You want to test your API client without hitting the real API during CI/CD. What do you use?",
         "The responses library to mock all HTTP calls", "A staging environment", "VCR.py only", "Manual stubs with unittest.mock.patch",
         "A", "The responses library provides easy mocking specifically designed for the requests library."),

        ("GET Requests", "Easy", "You need to check if a resource exists on a server without downloading the full content. Which is more efficient?",
         "Use requests.head(url) to send a HEAD request", "Use requests.get(url) and ignore the body", "Use requests.options(url)", "Use requests.get(url, stream=True)",
         "A", "HEAD requests retrieve only headers, not the body, making them efficient for existence checks."),

        ("POST Requests", "Easy", "You need to submit a contact form with name, email, and message fields. What is the simplest approach?",
         "requests.post(url, data={'name': 'John', 'email': 'j@e.com', 'message': 'Hi'})", "requests.get(url, params={'name': 'John', 'email': 'j@e.com'})", "requests.post(url, body='name=John&email=j@e.com')", "requests.submit(url, form={'name': 'John'})",
         "A", "POST with data dict is the standard way to submit form data."),

        ("SSL Verification", "Medium", "You want to test HTTPS requests in a CI environment where custom certificates are not installed. What is the recommended approach?",
         "Bundle the required CA certificates with the project and use verify='/path/to/certs'", "Set verify=False in all CI tests", "Skip HTTPS tests in CI", "Use HTTP instead of HTTPS in CI",
         "A", "Bundling CA certificates with the project ensures consistent SSL verification in any environment."),

        ("Retry Mechanism", "Easy", "A remote API is occasionally unreliable. What is the recommended way to add retry logic?",
         "Use HTTPAdapter with Retry from urllib3", "Write a while loop with try/except", "Set retry=True in requests.get()", "Use requests.retry()",
         "A", "HTTPAdapter with urllib3's Retry provides robust, configurable retry logic."),

        ("Streaming Responses", "Easy", "You are building a progress bar for a large file download. What information do you need?",
         "Content-Length header and iter_content() chunk sizes", "response.text length", "response.json() size", "response.elapsed",
         "A", "Content-Length gives total size; tracking chunks from iter_content() shows progress."),

        ("Headers", "Easy", "You need to tell the server you want a JSON response. Which header should you set?",
         "Accept: application/json", "Content-Type: application/json", "Response-Type: json", "Format: json",
         "A", "The Accept header tells the server what format the client prefers."),

        ("Query Parameters", "Hard", "You need to send a query parameter with the same key multiple times (e.g., for multi-select filters). How do you handle this?",
         "Use params={'color': ['red', 'blue']} or params=[('color', 'red'), ('color', 'blue')]", "Use params={'color': 'red,blue'}", "Send two separate requests", "Use params={'color[]': ['red', 'blue']}",
         "A", "Lists as values or list of tuples allow duplicate keys in query parameters."),

        ("Request Body", "Hard", "You need to send a request with a custom Content-Type that requests does not set automatically. How do you do this?",
         "Set the Content-Type header manually in the headers dict along with the data", "Use the content_type parameter", "Use the type parameter in data", "It is not possible to set custom Content-Types",
         "A", "Custom Content-Types are set by including them in the headers dictionary."),

        ("Response Handling", "Easy", "You want to get the encoding of a response to handle international characters. Where do you find it?",
         "response.encoding", "response.charset", "response.headers['encoding']", "response.text_encoding",
         "A", "response.encoding shows the encoding used to decode response.text."),

        ("Authentication - Bearer Token", "Easy", "You have an API key that should be sent as a Bearer token. How do you construct the header?",
         "{'Authorization': 'Bearer ' + api_key}", "{'Bearer': api_key}", "{'API-Key': api_key}", "{'auth': 'bearer:' + api_key}",
         "A", "Bearer tokens are sent in the Authorization header with 'Bearer ' prefix."),

        ("Authentication - OAuth", "Medium", "You need to implement OAuth2 with PKCE for a mobile app backend. What is the key difference from standard OAuth2?",
         "PKCE adds a code_verifier and code_challenge to prevent authorization code interception", "PKCE uses a different token endpoint", "PKCE does not require a redirect URI", "PKCE eliminates the need for client_secret",
         "A", "PKCE (Proof Key for Code Exchange) adds cryptographic verification to prevent code interception."),

        ("DELETE Requests", "Medium", "Your API requires confirmation data in the body of a DELETE request. How do you send it?",
         "requests.delete(url, json={'confirm': True})", "requests.delete(url, confirm=True)", "DELETE requests cannot have bodies", "Use POST with action=delete instead",
         "A", "The json parameter can be used with DELETE to include a request body."),

        ("PATCH Requests", "Hard", "You need to implement JSON Patch (RFC 6902) operations. How do you send the patch document?",
         "Send a list of operations via json= with Content-Type: application/json-patch+json", "Use a special patch parameter", "PATCH automatically understands JSON Patch", "Use data= with the patch document",
         "A", "JSON Patch operations are sent as a JSON array with the json-patch+json Content-Type."),

        ("PUT Requests", "Hard", "You need to upload a large file via PUT without loading it into memory. How do you accomplish this?",
         "Pass the file object directly to data=open('file', 'rb')", "Read the file into memory and pass to data", "Use the files parameter with PUT", "PUT does not support file uploads",
         "A", "An open file object passed to data is streamed, avoiding memory issues."),

        ("Error Handling", "Hard", "Your application needs to retry on network errors but fail immediately on authentication errors (401). How do you implement this?",
         "Catch ConnectionError for retries; catch HTTPError and check status_code for 401 to fail immediately", "Use status_forcelist to exclude 401", "Catch all exceptions and retry", "Use separate Session objects",
         "A", "Differentiated exception handling allows retry on network errors but immediate failure on 401."),

        ("Session Management", "Medium", "You need to mock a Session in tests while preserving its cookie-handling behavior. What approach works?",
         "Use the responses library which works transparently with Sessions", "Mock the Session class entirely", "Replace Session with raw requests calls", "Use a real test server",
         "A", "The responses library intercepts at the transport level, so Sessions work normally."),

        ("Mock Testing with responses", "Hard", "You need to test that your code handles pagination correctly by mocking multiple pages of results. How do you set this up?",
         "Add multiple responses for the same URL with different JSON bodies representing each page", "Use a callback function that tracks page state", "Mock only the first page", "responses cannot mock pagination",
         "A", "Multiple responses.add() calls for the same URL return responses in order, simulating pagination."),

        ("GET Requests", "Easy", "You want to check if an API is online by making a simple request. What is the quickest approach?",
         "Send a GET request and check if response.ok is True", "Ping the server with ICMP", "Open a raw TCP socket", "Use DNS lookup",
         "A", "A simple GET with response.ok check confirms API availability."),

        ("POST Requests", "Hard", "You need to send a webhook notification with a JSON payload and HMAC signature header. How do you structure this?",
         "Compute HMAC of the body, set it as a header, and use json= for the payload", "Use the auth parameter with HMAC", "Send HMAC in the query string", "Use a special webhook parameter",
         "A", "The HMAC signature is typically sent as a custom header alongside the JSON body."),

        ("Headers", "Easy", "You want to download a web page and the server needs to know you accept HTML. What header should you set?",
         "Accept: text/html", "Content-Type: text/html", "Format: html", "Download: html",
         "A", "The Accept header tells the server what content types the client accepts."),

        ("Response Handling", "Hard", "You receive a large JSON response and only need one field. What is the most memory-efficient approach?",
         "Parse with response.json() and extract the field (or use streaming JSON parser for very large responses)", "Save to disk first then parse", "Use regex on response.text", "Download as binary and parse manually",
         "A", "For most cases response.json() is fine; for extremely large JSON, a streaming parser helps."),

        ("SSL Verification", "Easy", "You get an SSLError when connecting to an HTTPS API. What is the most likely cause?",
         "The server's SSL certificate is invalid, expired, or not trusted", "The API is down", "The URL is incorrect", "You need to use HTTP instead",
         "A", "SSLError typically indicates certificate validation failure."),

        ("Timeout Handling", "Hard", "You need to implement a circuit breaker pattern for an unreliable API. What combination of features would you use?",
         "Track failures with a counter, use timeout and retry, and stop requests when failure threshold is reached", "Just set a very long timeout", "Only use retry with no limit", "Switch to async requests",
         "A", "A circuit breaker combines failure tracking, timeouts, and retries with a threshold."),

        ("File Upload", "Hard", "You need to upload a file with progress tracking. How do you implement this?",
         "Wrap the file object in a custom class that tracks bytes read and pass it to data=", "Use a progress callback parameter", "Use the on_upload parameter", "Monitor response.elapsed",
         "A", "A custom file wrapper that tracks read() calls enables progress monitoring."),

        ("Cookies", "Medium", "You need to handle cookies with specific domain and path restrictions. What approach is best?",
         "Use a Session which respects domain and path cookie rules automatically", "Parse Set-Cookie headers manually", "Send all cookies with every request", "Use separate cookie dicts per domain",
         "A", "Sessions use a proper cookie jar that respects domain and path attributes."),
    ]

    for sdata in scenario_questions_data:
        qid += 1
        questions.append(_q(qid, sdata[0], sdata[1], "scenario",
                            sdata[2], sdata[3], sdata[4], sdata[5], sdata[6],
                            sdata[7], sdata[8]))

    # ===================================================================
    # CODE COMPLETION questions (100) -- code_snippet filled, with ___
    # ===================================================================

    cc_questions = [
        (_q(0, "GET Requests", "Easy", "code_completion",
            "Fill in the blank to send a GET request.",
            "requests.get", "requests.send", "requests.fetch", "requests.read",
            "A", "requests.get() sends an HTTP GET request.",
            "import requests\nresponse = ___(url)")),

        (_q(0, "GET Requests", "Easy", "code_completion",
            "Fill in the blank to get the HTTP status code.",
            "status_code", "code", "status", "http_code",
            "A", "The status_code attribute holds the HTTP response status code.",
            "import requests\nresponse = requests.get(url)\nprint(response.___)")),

        (_q(0, "POST Requests", "Easy", "code_completion",
            "Fill in the blank to send JSON data in a POST request.",
            "json", "data", "body", "payload",
            "A", "The json parameter serialises the dict to JSON automatically.",
            "import requests\nresponse = requests.post(url, ___={'key': 'value'})")),

        (_q(0, "POST Requests", "Easy", "code_completion",
            "Fill in the blank to send form-encoded data.",
            "data", "form", "body", "json",
            "A", "The data parameter sends form-encoded data.",
            "import requests\nresponse = requests.post(url, ___={'username': 'admin', 'password': 'secret'})")),

        (_q(0, "PUT Requests", "Easy", "code_completion",
            "Fill in the blank to send a PUT request with JSON data.",
            "requests.put", "requests.update", "requests.replace", "requests.set",
            "A", "requests.put() sends an HTTP PUT request.",
            "import requests\nresponse = ___(url, json={'name': 'updated'})")),

        (_q(0, "DELETE Requests", "Easy", "code_completion",
            "Fill in the blank to send a DELETE request.",
            "requests.delete", "requests.remove", "requests.del", "requests.destroy",
            "A", "requests.delete() sends an HTTP DELETE request.",
            "import requests\nresponse = ___(url)")),

        (_q(0, "PATCH Requests", "Easy", "code_completion",
            "Fill in the blank to send a PATCH request.",
            "requests.patch", "requests.update", "requests.modify", "requests.partial",
            "A", "requests.patch() sends an HTTP PATCH request.",
            "import requests\nresponse = ___(url, json={'email': 'new@example.com'})")),

        (_q(0, "Headers", "Easy", "code_completion",
            "Fill in the blank to send a custom header.",
            "headers", "head", "header", "custom_headers",
            "A", "The headers parameter accepts a dictionary of HTTP headers.",
            "import requests\nresponse = requests.get(url, ___={'Authorization': 'Bearer token123'})")),

        (_q(0, "Headers", "Medium", "code_completion",
            "Fill in the blank to access the Content-Type response header.",
            "headers", "head", "header_dict", "response_headers",
            "A", "response.headers is a case-insensitive dict of response headers.",
            "import requests\nresponse = requests.get(url)\ncontent_type = response.___['Content-Type']")),

        (_q(0, "Query Parameters", "Easy", "code_completion",
            "Fill in the blank to add query parameters to the URL.",
            "params", "query", "args", "qs",
            "A", "The params parameter appends query parameters to the URL.",
            "import requests\nresponse = requests.get(url, ___={'page': 1, 'limit': 10})")),

        (_q(0, "Query Parameters", "Medium", "code_completion",
            "Fill in the blank to send multiple values for the same query parameter.",
            "params={'color': ['red', 'blue']}", "params={'color': 'red,blue'}", "query={'color': ['red', 'blue']}", "params={'colors': 'red|blue'}",
            "A", "A list value causes the key to be repeated in the query string.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Request Body", "Medium", "code_completion",
            "Fill in the blank to send raw XML data with the correct Content-Type.",
            "data=xml_string, headers={'Content-Type': 'application/xml'}", "json=xml_string", "xml=xml_string", "body=xml_string",
            "A", "Raw data is sent via data= with an explicit Content-Type header.",
            "import requests\nxml_string = '<root><item>test</item></root>'\nresponse = requests.post(url, ___)")),

        (_q(0, "Response Handling", "Easy", "code_completion",
            "Fill in the blank to parse the response as JSON.",
            "json()", "parse_json()", "to_json()", "decode_json()",
            "A", "response.json() parses the JSON response body.",
            "import requests\nresponse = requests.get(url)\ndata = response.___")),

        (_q(0, "Response Handling", "Easy", "code_completion",
            "Fill in the blank to get the response body as text.",
            "text", "body", "string", "content_text",
            "A", "response.text returns the decoded string content.",
            "import requests\nresponse = requests.get(url)\nbody = response.___")),

        (_q(0, "Response Handling", "Medium", "code_completion",
            "Fill in the blank to raise an error for HTTP error status codes.",
            "raise_for_status()", "check_status()", "verify()", "assert_ok()",
            "A", "raise_for_status() raises HTTPError for 4xx/5xx responses.",
            "import requests\nresponse = requests.get(url)\nresponse.___")),

        (_q(0, "Response Handling", "Medium", "code_completion",
            "Fill in the blank to get the response body as bytes.",
            "content", "bytes", "raw_data", "binary",
            "A", "response.content returns the response body as raw bytes.",
            "import requests\nresponse = requests.get(url)\nraw = response.___")),

        (_q(0, "Authentication - Basic", "Easy", "code_completion",
            "Fill in the blank to use HTTP Basic Authentication.",
            "auth=('user', 'password')", "login=('user', 'password')", "basic_auth=('user', 'password')", "credentials=('user', 'password')",
            "A", "A tuple passed to auth uses HTTP Basic Authentication.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Authentication - Basic", "Medium", "code_completion",
            "Fill in the blank to use explicit HTTPBasicAuth.",
            "HTTPBasicAuth('user', 'pass')", "BasicAuth('user', 'pass')", "Auth('user', 'pass')", "AuthBasic('user', 'pass')",
            "A", "HTTPBasicAuth provides explicit Basic authentication.",
            "from requests.auth import HTTPBasicAuth\nimport requests\nresponse = requests.get(url, auth=___)")),

        (_q(0, "Authentication - Bearer Token", "Easy", "code_completion",
            "Fill in the blank to send a Bearer token.",
            "'Bearer ' + token", "'Token ' + token", "'Auth ' + token", "token",
            "A", "Bearer tokens use the format 'Bearer <token>' in the Authorization header.",
            "import requests\ntoken = 'abc123'\nresponse = requests.get(url, headers={'Authorization': ___})")),

        (_q(0, "Session Management", "Easy", "code_completion",
            "Fill in the blank to create a session.",
            "requests.Session()", "requests.session()", "requests.new_session()", "requests.create_session()",
            "A", "requests.Session() creates a new Session object.",
            "import requests\nsession = ___")),

        (_q(0, "Session Management", "Medium", "code_completion",
            "Fill in the blank to set default headers on a session.",
            "session.headers.update({'X-API-Key': 'key123'})", "session.set_headers({'X-API-Key': 'key123'})", "session.default_headers = {'X-API-Key': 'key123'}", "session.add_header('X-API-Key', 'key123')",
            "A", "session.headers.update() adds default headers for all requests.",
            "import requests\nsession = requests.Session()\n___")),

        (_q(0, "Session Management", "Medium", "code_completion",
            "Fill in the blank to use a session as a context manager.",
            "requests.Session()", "requests.connect()", "requests.open()", "requests.start()",
            "A", "Session supports the context manager protocol.",
            "import requests\nwith ___ as s:\n    r = s.get(url)")),

        (_q(0, "Timeout Handling", "Easy", "code_completion",
            "Fill in the blank to set a 5-second timeout.",
            "timeout=5", "max_time=5", "wait=5", "limit=5",
            "A", "The timeout parameter sets the timeout in seconds.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Timeout Handling", "Medium", "code_completion",
            "Fill in the blank to set separate connect and read timeouts.",
            "timeout=(3, 10)", "timeout=3, read_timeout=10", "connect_timeout=3, timeout=10", "timeouts={'connect': 3, 'read': 10}",
            "A", "A tuple sets (connect_timeout, read_timeout).",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Timeout Handling", "Hard", "code_completion",
            "Fill in the blank to catch a timeout exception.",
            "requests.exceptions.Timeout", "TimeoutError", "socket.timeout", "requests.Timeout",
            "A", "requests.exceptions.Timeout is the correct exception class.",
            "import requests\ntry:\n    requests.get(url, timeout=1)\nexcept ___ as e:\n    print('Request timed out')")),

        (_q(0, "Retry Mechanism", "Medium", "code_completion",
            "Fill in the blank to create a retry strategy.",
            "Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503])", "Retry(max=3, delay=0.5)", "Retry(count=3, wait=0.5)", "Retry(retries=3, backoff=0.5)",
            "A", "Retry accepts total, backoff_factor, and status_forcelist parameters.",
            "from urllib3.util.retry import Retry\nretry_strategy = ___")),

        (_q(0, "Retry Mechanism", "Medium", "code_completion",
            "Fill in the blank to mount the retry adapter on a session.",
            "session.mount('https://', adapter)", "session.add_adapter('https://', adapter)", "session.use(adapter)", "session.retry = adapter",
            "A", "session.mount() attaches an adapter to a URL prefix.",
            "from requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\nimport requests\n\nsession = requests.Session()\nretry = Retry(total=3)\nadapter = HTTPAdapter(max_retries=retry)\n___")),

        (_q(0, "Retry Mechanism", "Hard", "code_completion",
            "Fill in the blank to create an HTTPAdapter with retry logic.",
            "HTTPAdapter(max_retries=retry_strategy)", "HTTPAdapter(retry=retry_strategy)", "HTTPAdapter(retries=retry_strategy)", "HTTPAdapter(strategy=retry_strategy)",
            "A", "HTTPAdapter accepts max_retries parameter for retry configuration.",
            "from requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\n\nretry_strategy = Retry(total=3)\nadapter = ___")),

        (_q(0, "SSL Verification", "Easy", "code_completion",
            "Fill in the blank to disable SSL verification.",
            "verify=False", "ssl=False", "check_ssl=False", "secure=False",
            "A", "verify=False disables SSL certificate verification.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "SSL Verification", "Medium", "code_completion",
            "Fill in the blank to use a custom CA bundle.",
            "verify='/path/to/ca-bundle.crt'", "ca='/path/to/ca-bundle.crt'", "ssl_ca='/path/to/ca-bundle.crt'", "cert='/path/to/ca-bundle.crt'",
            "A", "The verify parameter accepts a path to a CA bundle file.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "SSL Verification", "Hard", "code_completion",
            "Fill in the blank to provide a client certificate.",
            "cert=('/path/client.cert', '/path/client.key')", "verify=('/path/client.cert', '/path/client.key')", "ssl_cert=('/path/client.cert', '/path/client.key')", "client_cert='/path/client.cert'",
            "A", "cert takes a tuple of (cert_file, key_file) for client certificates.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Streaming Responses", "Easy", "code_completion",
            "Fill in the blank to enable response streaming.",
            "stream=True", "chunked=True", "buffer=True", "lazy=True",
            "A", "stream=True defers downloading the response body.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Streaming Responses", "Medium", "code_completion",
            "Fill in the blank to iterate over streamed content in 1024-byte chunks.",
            "response.iter_content(chunk_size=1024)", "response.read(1024)", "response.chunks(1024)", "response.stream(1024)",
            "A", "iter_content() yields chunks of the specified size.",
            "import requests\nresponse = requests.get(url, stream=True)\nfor chunk in ___:\n    process(chunk)")),

        (_q(0, "Streaming Responses", "Hard", "code_completion",
            "Fill in the blank to iterate over lines of a streaming response.",
            "response.iter_lines()", "response.readlines()", "response.lines()", "response.split_lines()",
            "A", "iter_lines() yields one line at a time from the streaming response.",
            "import requests\nresponse = requests.get(url, stream=True)\nfor line in ___:\n    print(line.decode('utf-8'))")),

        (_q(0, "File Upload", "Easy", "code_completion",
            "Fill in the blank to upload a file.",
            "files={'file': open('report.pdf', 'rb')}", "file=open('report.pdf', 'rb')", "upload=open('report.pdf', 'rb')", "data=open('report.pdf', 'rb')",
            "A", "The files parameter handles multipart file uploads.",
            "import requests\nresponse = requests.post(url, ___)")),

        (_q(0, "File Upload", "Medium", "code_completion",
            "Fill in the blank to upload a file with a custom filename and MIME type.",
            "files={'upload': ('custom_name.csv', f, 'text/csv')}", "files={'upload': f, 'name': 'custom_name.csv'}", "files={'upload': f}, filename='custom_name.csv'", "files={'upload': ('custom_name.csv', f)}",
            "A", "A tuple of (filename, file_obj, content_type) provides full control.",
            "import requests\nf = open('data.csv', 'rb')\nresponse = requests.post(url, ___)\nf.close()")),

        (_q(0, "File Upload", "Hard", "code_completion",
            "Fill in the blank to upload in-memory data as a file.",
            "files={'file': ('data.json', io.BytesIO(json_bytes), 'application/json')}", "files={'file': json_bytes}", "data=json_bytes, filename='data.json'", "upload=io.BytesIO(json_bytes)",
            "A", "BytesIO simulates a file object from in-memory data.",
            "import requests\nimport io\njson_bytes = b'{\"key\": \"value\"}'\nresponse = requests.post(url, ___)")),

        (_q(0, "Cookies", "Easy", "code_completion",
            "Fill in the blank to send cookies with a request.",
            "cookies={'session_id': 'abc123'}", "cookie='session_id=abc123'", "headers={'Cookie': 'abc123'}", "jar={'session_id': 'abc123'}",
            "A", "The cookies parameter accepts a dict of cookie name-value pairs.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Cookies", "Medium", "code_completion",
            "Fill in the blank to access a specific cookie from the response.",
            "response.cookies['session_id']", "response.get_cookie('session_id')", "response.cookie('session_id')", "response.headers['Cookie']",
            "A", "response.cookies supports dict-like access.",
            "import requests\nresponse = requests.get(url)\nsession_id = ___")),

        (_q(0, "Cookies", "Hard", "code_completion",
            "Fill in the blank to create a cookie jar and set a cookie on it.",
            "jar = requests.cookies.RequestsCookieJar()\njar.set('token', 'abc')", "jar = dict()\njar['token'] = 'abc'", "jar = requests.CookieJar()\njar.add('token', 'abc')", "jar = requests.cookies.CookieDict()\njar['token'] = 'abc'",
            "A", "RequestsCookieJar provides the set() method for adding cookies.",
            "import requests\n___\nresponse = requests.get(url, cookies=jar)")),

        (_q(0, "Redirects", "Easy", "code_completion",
            "Fill in the blank to disable automatic redirect following.",
            "allow_redirects=False", "redirect=False", "follow=False", "no_redirect=True",
            "A", "allow_redirects=False prevents automatic redirect following.",
            "import requests\nresponse = requests.get(url, ___)")),

        (_q(0, "Redirects", "Medium", "code_completion",
            "Fill in the blank to get the redirect history.",
            "response.history", "response.redirects", "response.chain", "response.previous",
            "A", "response.history is a list of intermediate Response objects.",
            "import requests\nresponse = requests.get(url)\nredirects = ___")),

        (_q(0, "Redirects", "Hard", "code_completion",
            "Fill in the blank to access the Location header from a non-followed redirect.",
            "response.headers['Location']", "response.location", "response.redirect_url", "response.next_url",
            "A", "The Location header contains the redirect target URL.",
            "import requests\nresponse = requests.get(url, allow_redirects=False)\nnext_url = ___")),

        (_q(0, "Error Handling", "Easy", "code_completion",
            "Fill in the blank to catch connection errors.",
            "requests.exceptions.ConnectionError", "ConnectionError", "requests.ConnectionError", "socket.error",
            "A", "requests.exceptions.ConnectionError handles network failures.",
            "import requests\ntry:\n    response = requests.get(url)\nexcept ___ as e:\n    print('Connection failed')")),

        (_q(0, "Error Handling", "Medium", "code_completion",
            "Fill in the blank to catch all requests-related exceptions.",
            "requests.exceptions.RequestException", "requests.Error", "Exception", "requests.RequestError",
            "A", "RequestException is the base class for all requests exceptions.",
            "import requests\ntry:\n    response = requests.get(url)\nexcept ___ as e:\n    print(f'Request failed: {e}')")),

        (_q(0, "Error Handling", "Hard", "code_completion",
            "Fill in the blank to catch HTTP errors from raise_for_status().",
            "requests.exceptions.HTTPError", "requests.HTTPError", "HTTPError", "requests.exceptions.StatusError",
            "A", "HTTPError is raised by raise_for_status() for 4xx/5xx.",
            "import requests\ntry:\n    response = requests.get(url)\n    response.raise_for_status()\nexcept ___ as e:\n    print(f'HTTP error: {e}')")),

        (_q(0, "Mock Testing with responses", "Easy", "code_completion",
            "Fill in the blank to activate response mocking.",
            "@responses.activate", "@responses.mock", "@responses.enable", "@responses.patch",
            "A", "@responses.activate enables response mocking for the function.",
            "import responses\nimport requests\n\n___\ndef test_api():\n    responses.add(responses.GET, 'http://api.com/data', json={}, status=200)\n    r = requests.get('http://api.com/data')\n    assert r.status_code == 200")),

        (_q(0, "Mock Testing with responses", "Medium", "code_completion",
            "Fill in the blank to register a mock GET response.",
            "responses.add(responses.GET, url, json={'key': 'value'}, status=200)", "responses.mock(url, 'GET', data={'key': 'value'})", "responses.register('GET', url, response={'key': 'value'})", "responses.get(url, return_value={'key': 'value'})",
            "A", "responses.add() registers a mock response for a method and URL.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    url = 'http://api.com/data'\n    ___\n    r = requests.get(url)\n    assert r.json()['key'] == 'value'")),

        (_q(0, "Mock Testing with responses", "Hard", "code_completion",
            "Fill in the blank to check how many requests were made.",
            "len(responses.calls)", "responses.call_count", "responses.num_calls()", "len(responses.history)",
            "A", "responses.calls is a list of all intercepted calls.",
            "import responses\nimport requests\n\n@responses.activate\ndef test():\n    responses.add(responses.GET, 'http://api.com/data', json={}, status=200)\n    requests.get('http://api.com/data')\n    requests.get('http://api.com/data')\n    assert ___ == 2")),

        (_q(0, "GET Requests", "Medium", "code_completion",
            "Fill in the blank to access the final URL after redirects.",
            "response.url", "response.final_url", "response.location", "response.target",
            "A", "response.url contains the final URL after any redirects.",
            "import requests\nresponse = requests.get(url)\nfinal_url = ___")),

        (_q(0, "POST Requests", "Medium", "code_completion",
            "Fill in the blank to send both form data and a file in one request.",
            "data={'field': 'value'}, files={'file': open('doc.pdf', 'rb')}", "json={'field': 'value'}, files={'file': open('doc.pdf', 'rb')}", "body={'field': 'value', 'file': open('doc.pdf', 'rb')}", "form={'field': 'value'}, upload={'file': open('doc.pdf', 'rb')}",
            "A", "data and files can be used together for multipart requests.",
            "import requests\nresponse = requests.post(url, ___)")),

        (_q(0, "Response Handling", "Hard", "code_completion",
            "Fill in the blank to access the request that was sent.",
            "response.request", "response.sent_request", "response.original", "response.req",
            "A", "response.request contains the PreparedRequest that was sent.",
            "import requests\nresponse = requests.get(url)\nsent_request = ___")),

        (_q(0, "Session Management", "Hard", "code_completion",
            "Fill in the blank to set a proxy on the session.",
            "session.proxies = {'http': 'http://proxy:8080', 'https': 'http://proxy:8080'}", "session.proxy = 'http://proxy:8080'", "session.set_proxy('http://proxy:8080')", "session.config['proxy'] = 'http://proxy:8080'",
            "A", "session.proxies is a dict mapping protocols to proxy URLs.",
            "import requests\nsession = requests.Session()\n___")),

        (_q(0, "Authentication - Bearer Token", "Medium", "code_completion",
            "Fill in the blank to create a custom Bearer auth class.",
            "AuthBase", "BaseAuth", "HTTPAuth", "Auth",
            "A", "Custom auth classes should inherit from requests.auth.AuthBase.",
            "from requests.auth import ___\n\nclass BearerAuth(___):\n    def __init__(self, token):\n        self.token = token\n    def __call__(self, r):\n        r.headers['Authorization'] = f'Bearer {self.token}'\n        return r")),

        (_q(0, "Authentication - OAuth", "Hard", "code_completion",
            "Fill in the blank to use OAuth1 authentication.",
            "OAuth1('client_key', 'client_secret', 'resource_owner_key', 'resource_owner_secret')", "OAuth1Auth('client_key', 'client_secret')", "OAuth('client_key', 'client_secret')", "OAuthHandler('client_key', 'client_secret')",
            "A", "OAuth1 from requests_oauthlib takes client and resource owner credentials.",
            "from requests_oauthlib import OAuth1\nimport requests\n\nauth = ___\nresponse = requests.get(url, auth=auth)")),

        (_q(0, "Retry Mechanism", "Hard", "code_completion",
            "Fill in the blank to configure retry with specific allowed methods.",
            "allowed_methods=['GET', 'HEAD', 'OPTIONS']", "methods=['GET', 'HEAD', 'OPTIONS']", "retry_methods=['GET', 'HEAD', 'OPTIONS']", "method_list=['GET', 'HEAD', 'OPTIONS']",
            "A", "allowed_methods restricts which HTTP methods are eligible for retry.",
            "from urllib3.util.retry import Retry\nretry = Retry(total=3, ___)")),

        (_q(0, "Streaming Responses", "Medium", "code_completion",
            "Fill in the blank to download a file in chunks.",
            "response.iter_content(chunk_size=8192)", "response.read(8192)", "response.chunks(8192)", "response.download(8192)",
            "A", "iter_content() with a chunk size efficiently downloads large files.",
            "import requests\nresponse = requests.get(url, stream=True)\nwith open('output.bin', 'wb') as f:\n    for chunk in ___:\n        f.write(chunk)")),

        (_q(0, "Error Handling", "Medium", "code_completion",
            "Fill in the blank to check if the response was successful.",
            "response.ok", "response.success", "response.is_ok", "response.good",
            "A", "response.ok returns True for status codes below 400.",
            "import requests\nresponse = requests.get(url)\nif ___:\n    print('Success')\nelse:\n    print('Failed')")),

        (_q(0, "Cookies", "Medium", "code_completion",
            "Fill in the blank to get all cookies as a dictionary.",
            "dict(response.cookies)", "response.cookies.to_dict()", "response.cookies.as_dict()", "dict(response.headers['Set-Cookie'])",
            "A", "dict() converts RequestsCookieJar to a regular dictionary.",
            "import requests\nresponse = requests.get(url)\ncookie_dict = ___")),

        (_q(0, "Headers", "Medium", "code_completion",
            "Fill in the blank to set Accept and Content-Type headers.",
            "headers={'Accept': 'application/json', 'Content-Type': 'application/json'}", "accept='application/json', content_type='application/json'", "headers='Accept: application/json, Content-Type: application/json'", "header_accept='application/json', header_content='application/json'",
            "A", "Multiple headers are set as key-value pairs in the headers dict.",
            "import requests\nresponse = requests.post(url, json=data, ___)")),

        (_q(0, "Request Body", "Easy", "code_completion",
            "Fill in the blank to send a string as the request body.",
            "data='Hello, World!'", "body='Hello, World!'", "text='Hello, World!'", "content='Hello, World!'",
            "A", "Strings passed to data are sent as-is in the body.",
            "import requests\nresponse = requests.post(url, ___)")),

        (_q(0, "Request Body", "Hard", "code_completion",
            "Fill in the blank to send a generator for chunked transfer encoding.",
            "data=data_generator()", "body=data_generator()", "stream=data_generator()", "chunks=data_generator()",
            "A", "A generator passed to data enables chunked transfer encoding.",
            "import requests\n\ndef data_generator():\n    for i in range(10):\n        yield f'chunk_{i}\\n'.encode()\n\nresponse = requests.post(url, ___)")),

        (_q(0, "GET Requests", "Hard", "code_completion",
            "Fill in the blank to access the elapsed time of a request.",
            "response.elapsed", "response.time", "response.duration", "response.latency",
            "A", "response.elapsed is a timedelta representing request-response time.",
            "import requests\nresponse = requests.get(url)\nprint(f'Request took: {___}')")),

        (_q(0, "POST Requests", "Hard", "code_completion",
            "Fill in the blank to prepare a request without sending it.",
            "requests.Request('POST', url, json=data)", "requests.PreparedRequest('POST', url)", "requests.prepare('POST', url)", "requests.create_request('POST', url)",
            "A", "requests.Request() creates a Request object that can be prepared and sent.",
            "import requests\ndata = {'key': 'value'}\nreq = ___\nprepared = req.prepare()")),

        (_q(0, "Session Management", "Easy", "code_completion",
            "Fill in the blank to close a session.",
            "session.close()", "session.disconnect()", "session.end()", "session.shutdown()",
            "A", "session.close() releases adapters and connections.",
            "import requests\nsession = requests.Session()\n# ... use session ...\n___")),

        (_q(0, "Session Management", "Medium", "code_completion",
            "Fill in the blank to set authentication for all session requests.",
            "session.auth = ('admin', 'password')", "session.set_auth('admin', 'password')", "session.login('admin', 'password')", "session.credentials = ('admin', 'password')",
            "A", "session.auth sets default authentication for all session requests.",
            "import requests\nsession = requests.Session()\n___")),

        (_q(0, "Timeout Handling", "Medium", "code_completion",
            "Fill in the blank to handle a timeout gracefully.",
            "requests.exceptions.Timeout", "TimeoutError", "socket.timeout", "requests.TimeoutError",
            "A", "requests.exceptions.Timeout catches request timeouts.",
            "import requests\ntry:\n    response = requests.get(url, timeout=5)\nexcept ___ :\n    print('The request timed out')\n    response = None")),

        (_q(0, "Mock Testing with responses", "Medium", "code_completion",
            "Fill in the blank to mock a POST request returning 201.",
            "responses.add(responses.POST, url, json={'id': 1}, status=201)", "responses.mock(responses.POST, url, status=201)", "responses.post(url, status=201)", "responses.register(responses.POST, url, 201)",
            "A", "responses.add() with responses.POST mocks a POST endpoint.",
            "import responses\nimport requests\n\n@responses.activate\ndef test_create():\n    url = 'http://api.com/items'\n    ___\n    r = requests.post(url, json={'name': 'test'})\n    assert r.status_code == 201")),

        (_q(0, "SSL Verification", "Medium", "code_completion",
            "Fill in the blank to suppress SSL warnings.",
            "urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)", "warnings.filterwarnings('ignore', 'SSL')", "requests.disable_ssl_warnings()", "ssl.disable_warnings()",
            "A", "urllib3.disable_warnings with InsecureRequestWarning suppresses SSL warnings.",
            "import urllib3\n___")),

        (_q(0, "Redirects", "Medium", "code_completion",
            "Fill in the blank to check if any redirects occurred.",
            "len(response.history) > 0", "response.was_redirected", "response.redirected", "response.has_redirect",
            "A", "A non-empty response.history indicates redirects occurred.",
            "import requests\nresponse = requests.get(url)\nif ___:\n    print(f'Redirected {len(response.history)} time(s)')")),

        (_q(0, "File Upload", "Medium", "code_completion",
            "Fill in the blank to upload multiple files.",
            "files=[('file', ('a.txt', open('a.txt','rb'))), ('file', ('b.txt', open('b.txt','rb')))]", "files={'a.txt': open('a.txt','rb'), 'b.txt': open('b.txt','rb')}", "files=[open('a.txt','rb'), open('b.txt','rb')]", "uploads=['a.txt', 'b.txt']",
            "A", "A list of tuples allows uploading multiple files with the same field name.",
            "import requests\nresponse = requests.post(url, ___)")),

        (_q(0, "GET Requests", "Easy", "code_completion",
            "Fill in the blank to import the requests library.",
            "import requests", "from http import requests", "import request", "from urllib import requests",
            "A", "'import requests' is the correct import statement.",
            "___\nresponse = requests.get('https://example.com')")),

        (_q(0, "Response Handling", "Easy", "code_completion",
            "Fill in the blank to check the response status code.",
            "response.status_code == 200", "response.code == 200", "response.status == 200", "response.http_status == 200",
            "A", "status_code holds the HTTP status code.",
            "import requests\nresponse = requests.get(url)\nif ___:\n    print('Success!')")),

        (_q(0, "Error Handling", "Easy", "code_completion",
            "Fill in the blank to handle missing URL schema.",
            "requests.exceptions.MissingSchema", "requests.exceptions.InvalidURL", "ValueError", "URLError",
            "A", "MissingSchema is raised for URLs without http:// or https://.",
            "import requests\ntry:\n    requests.get('not-a-url')\nexcept ___:\n    print('Invalid URL: missing schema')")),

        (_q(0, "Headers", "Hard", "code_completion",
            "Fill in the blank to inspect the request headers that were sent.",
            "response.request.headers", "response.sent_headers", "response.outgoing_headers", "requests.last_headers",
            "A", "response.request.headers shows headers from the sent PreparedRequest.",
            "import requests\nresponse = requests.get(url, headers={'Accept': 'text/html'})\nsent_headers = ___")),

        (_q(0, "Query Parameters", "Hard", "code_completion",
            "Fill in the blank to send a request with both URL query string and params.",
            "requests.get('https://api.com/search?type=all', params={'q': 'python'})", "requests.get('https://api.com/search', query='type=all&q=python')", "requests.get('https://api.com/search?type=all&q=python', params=None)", "requests.get('https://api.com/search', params='type=all&q=python')",
            "A", "params are appended to any existing query string in the URL.",
            "# Result URL: https://api.com/search?type=all&q=python\nresponse = ___")),

        (_q(0, "Session Management", "Hard", "code_completion",
            "Fill in the blank to mount an HTTPAdapter on a session for connection pooling.",
            "session.mount('https://', HTTPAdapter(pool_connections=10, pool_maxsize=20))", "session.adapter = HTTPAdapter(pool_connections=10)", "session.pool(connections=10, maxsize=20)", "session.set_pool(10, 20)",
            "A", "HTTPAdapter accepts pool_connections and pool_maxsize for connection pooling.",
            "from requests.adapters import HTTPAdapter\nimport requests\n\nsession = requests.Session()\n___")),

        (_q(0, "Authentication - Basic", "Hard", "code_completion",
            "Fill in the blank to use Digest Authentication.",
            "HTTPDigestAuth('user', 'pass')", "DigestAuth('user', 'pass')", "HTTPDigest('user', 'pass')", "AuthDigest('user', 'pass')",
            "A", "HTTPDigestAuth from requests.auth provides Digest authentication.",
            "from requests.auth import HTTPDigestAuth\nimport requests\n\nresponse = requests.get(url, auth=___)")),

        (_q(0, "Retry Mechanism", "Easy", "code_completion",
            "Fill in the blank to create an HTTPAdapter.",
            "HTTPAdapter(max_retries=3)", "HTTPAdapter(retries=3)", "HTTPAdapter(retry=3)", "HTTPAdapter(attempts=3)",
            "A", "HTTPAdapter accepts max_retries for simple retry configuration.",
            "from requests.adapters import HTTPAdapter\nadapter = ___")),

        (_q(0, "Streaming Responses", "Hard", "code_completion",
            "Fill in the blank to close a streaming response and release the connection.",
            "response.close()", "response.disconnect()", "response.release()", "response.end()",
            "A", "response.close() releases the connection back to the pool.",
            "import requests\nresponse = requests.get(url, stream=True)\nfor chunk in response.iter_content(1024):\n    process(chunk)\n___")),

        (_q(0, "Mock Testing with responses", "Hard", "code_completion",
            "Fill in the blank to add a passthrough URL.",
            "responses.add_passthrough(responses.GET, 'https://allowed.com')", "responses.passthrough('https://allowed.com')", "responses.allow('https://allowed.com')", "responses.whitelist('https://allowed.com')",
            "A", "responses.add_passthrough allows specific URLs to bypass mocking.",
            "import responses\n\n@responses.activate\ndef test():\n    ___\n    # This URL will make a real HTTP request")),

        (_q(0, "Error Handling", "Hard", "code_completion",
            "Fill in the blank to catch chunked encoding errors.",
            "requests.exceptions.ChunkedEncodingError", "requests.exceptions.EncodingError", "requests.exceptions.StreamError", "requests.exceptions.TransferError",
            "A", "ChunkedEncodingError is raised for incomplete chunked responses.",
            "import requests\ntry:\n    response = requests.get(url, stream=True)\n    for chunk in response.iter_content(1024):\n        pass\nexcept ___ as e:\n    print('Stream interrupted')")),

        (_q(0, "Response Handling", "Hard", "code_completion",
            "Fill in the blank to set the response encoding manually.",
            "response.encoding = 'utf-8'", "response.set_encoding('utf-8')", "response.charset = 'utf-8'", "response.decode_as = 'utf-8'",
            "A", "Setting response.encoding before accessing .text changes the decoding.",
            "import requests\nresponse = requests.get(url)\n___\ntext = response.text")),

        (_q(0, "Cookies", "Hard", "code_completion",
            "Fill in the blank to access the domain of a specific cookie.",
            "response.cookies.list_domains()", "response.cookies.domains()", "response.cookies.get_domains()", "response.cookies.domain_list()",
            "A", "list_domains() returns all cookie domains.",
            "import requests\nresponse = requests.get(url)\ndomains = ___")),

        (_q(0, "PUT Requests", "Medium", "code_completion",
            "Fill in the blank to send a complete resource update via PUT.",
            "requests.put(url, json=updated_resource)", "requests.update(url, json=updated_resource)", "requests.replace(url, json=updated_resource)", "requests.set(url, json=updated_resource)",
            "A", "requests.put() with json= sends a complete resource replacement.",
            "import requests\nupdated_resource = {'name': 'New Name', 'email': 'new@example.com', 'age': 30}\nresponse = ___")),

        (_q(0, "DELETE Requests", "Medium", "code_completion",
            "Fill in the blank to send a DELETE request with a confirmation body.",
            "requests.delete(url, json={'confirm': True})", "requests.delete(url, confirm=True)", "requests.remove(url, data={'confirm': True})", "requests.delete(url, body={'confirm': True})",
            "A", "json parameter works with DELETE to include a request body.",
            "import requests\nresponse = ___")),

        (_q(0, "PATCH Requests", "Medium", "code_completion",
            "Fill in the blank to send a partial update.",
            "requests.patch(url, json={'status': 'active'})", "requests.update(url, json={'status': 'active'})", "requests.partial(url, json={'status': 'active'})", "requests.modify(url, json={'status': 'active'})",
            "A", "requests.patch() sends a partial update request.",
            "import requests\nresponse = ___")),

        (_q(0, "Redirects", "Hard", "code_completion",
            "Fill in the blank to check if the response is a permanent redirect.",
            "response.is_permanent_redirect", "response.permanent", "response.status_code == 301", "response.redirect_type == 'permanent'",
            "A", "response.is_permanent_redirect checks for 301/308 status codes.",
            "import requests\nresponse = requests.get(url, allow_redirects=False)\nis_permanent = ___")),

        (_q(0, "GET Requests", "Medium", "code_completion",
            "Fill in the blank to send a HEAD request.",
            "requests.head(url)", "requests.get(url, method='HEAD')", "requests.get(url, head_only=True)", "requests.header(url)",
            "A", "requests.head() sends an HTTP HEAD request.",
            "import requests\nresponse = ___")),

        (_q(0, "POST Requests", "Medium", "code_completion",
            "Fill in the blank to access the echoed form data from httpbin.",
            "response.json()['form']", "response.form", "response.json()['data']", "response.json()['body']",
            "A", "httpbin echoes form data in the 'form' key of the JSON response.",
            "import requests\nresponse = requests.post('https://httpbin.org/post', data={'key': 'value'})\nform_data = ___")),

        (_q(0, "Response Handling", "Medium", "code_completion",
            "Fill in the blank to access the response's Link header parsed as a dict.",
            "response.links", "response.link_headers", "response.parsed_links", "response.header_links",
            "A", "response.links parses the Link header into a dictionary.",
            "import requests\nresponse = requests.get(url)\npagination = ___")),

        (_q(0, "Session Management", "Medium", "code_completion",
            "Fill in the blank to verify cookies are persisted in the session.",
            "session.cookies", "session.get_cookies()", "session.cookie_jar", "session.stored_cookies",
            "A", "session.cookies is a CookieJar containing all session cookies.",
            "import requests\nsession = requests.Session()\nsession.get('https://httpbin.org/cookies/set/test/123')\nprint(___)")),

        (_q(0, "Timeout Handling", "Hard", "code_completion",
            "Fill in the blank to catch specifically a read timeout.",
            "requests.exceptions.ReadTimeout", "requests.exceptions.Timeout", "ReadTimeoutError", "socket.timeout",
            "A", "ReadTimeout is a subclass of Timeout for read-specific timeouts.",
            "import requests\ntry:\n    response = requests.get(url, timeout=(5, 1))\nexcept ___ :\n    print('Server took too long to send data')")),

        (_q(0, "Mock Testing with responses", "Easy", "code_completion",
            "Fill in the blank to import the responses library.",
            "import responses", "from mock import responses", "import mock.responses", "from requests import responses",
            "A", "'import responses' imports the responses mocking library.",
            "___\nimport requests")),

        (_q(0, "SSL Verification", "Hard", "code_completion",
            "Fill in the blank to set REQUESTS_CA_BUNDLE via environment variable.",
            "os.environ['REQUESTS_CA_BUNDLE'] = '/path/to/ca-bundle.crt'", "os.environ['SSL_CERT_FILE'] = '/path/to/ca-bundle.crt'", "os.environ['CA_BUNDLE'] = '/path/to/ca-bundle.crt'", "requests.set_ca_bundle('/path/to/ca-bundle.crt')",
            "A", "REQUESTS_CA_BUNDLE env var sets the default CA bundle path.",
            "import os\n___")),

        (_q(0, "File Upload", "Easy", "code_completion",
            "Fill in the blank to open a file for upload in the correct mode.",
            "open('image.png', 'rb')", "open('image.png', 'r')", "open('image.png', 'w')", "open('image.png', 'rw')",
            "A", "Files for upload should be opened in binary read mode ('rb').",
            "import requests\nf = ___\nresponse = requests.post(url, files={'image': f})\nf.close()")),

        (_q(0, "Authentication - OAuth", "Medium", "code_completion",
            "Fill in the blank to create an OAuth2 session.",
            "OAuth2Session(client_id)", "OAuth2(client_id)", "OAuth2Client(client_id)", "OAuthSession(client_id)",
            "A", "OAuth2Session from requests_oauthlib manages OAuth2 flows.",
            "from requests_oauthlib import OAuth2Session\nsession = ___")),

        (_q(0, "Response Handling", "Hard", "code_completion",
            "Fill in the blank to get the apparent encoding detected from the content.",
            "response.apparent_encoding", "response.detected_encoding", "response.guess_encoding()", "response.auto_encoding",
            "A", "apparent_encoding uses chardet/charset_normalizer to detect encoding.",
            "import requests\nresponse = requests.get(url)\ndetected = ___")),

        (_q(0, "GET Requests", "Easy", "code_completion",
            "Fill in the blank to check if the response was successful.",
            "response.ok", "response.success", "response.is_ok()", "response.good",
            "A", "response.ok returns True for status codes less than 400.",
            "import requests\nresponse = requests.get(url)\nif ___:\n    data = response.json()")),

        (_q(0, "Session Management", "Hard", "code_completion",
            "Fill in the blank to add event hooks to a session.",
            "session.hooks['response'].append(log_response)", "session.on_response(log_response)", "session.add_hook('response', log_response)", "session.callback = log_response",
            "A", "session.hooks['response'] is a list of callback functions.",
            "import requests\n\ndef log_response(response, *args, **kwargs):\n    print(f'{response.status_code}: {response.url}')\n\nsession = requests.Session()\n___")),
    ]

    for cq in cc_questions:
        qid += 1
        cq["id"] = qid
        questions.append(cq)

    # --- Verify counts ---
    type_counts = {}
    for q in questions:
        type_counts[q["type"]] = type_counts.get(q["type"], 0) + 1

    assert len(questions) == 500, f"Expected 500 questions, got {len(questions)}"
    assert type_counts.get("mcq", 0) == 200, f"Expected 200 mcq, got {type_counts.get('mcq', 0)}"
    assert type_counts.get("output", 0) == 100, f"Expected 100 output, got {type_counts.get('output', 0)}"
    assert type_counts.get("scenario", 0) == 100, f"Expected 100 scenario, got {type_counts.get('scenario', 0)}"
    assert type_counts.get("code_completion", 0) == 100, f"Expected 100 code_completion, got {type_counts.get('code_completion', 0)}"

    return questions


def main():
    questions = generate_questions()
    df = pd.DataFrame(questions)

    # Ensure correct column order
    columns = ["id", "subject", "topic", "difficulty", "type", "question",
               "option_a", "option_b", "option_c", "option_d",
               "correct_answer", "explanation", "code_snippet"]
    df = df[columns]

    output_path = r"D:\HackerRankSimulation\question_bank\python_requests_questions.csv"
    df.to_csv(output_path, index=False, quoting=csv.QUOTE_ALL)

    print(f"Row count: {len(df)}")

    # Print type distribution
    print("\nType distribution:")
    for t, count in df["type"].value_counts().items():
        print(f"  {t}: {count}")

    # Print difficulty distribution
    print("\nDifficulty distribution:")
    for d, count in df["difficulty"].value_counts().items():
        pct = count / len(df) * 100
        print(f"  {d}: {count} ({pct:.1f}%)")


if __name__ == "__main__":
    main()
