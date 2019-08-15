import 'es6-promise/auto';
import 'isomorphic-fetch';

import * as merge from 'object-assign';

export interface FetchOptions {
  payload?: any;
  body?: any;
  headers?: any;
}

export class APIError extends Error {
  status: number;
  data: any;
}

export default class API {
  sessionName: string;
  URL: string;

  constructor(sessionName: string = 'app', url: string = null) {
    this.sessionName = sessionName.toLowerCase() + '-session';

    if (url && !url.match(/^\//)) {
      this.URL = url;
    } else {
      // Try to guess the base URL
      this.URL = '';
      if (typeof document !== 'undefined') {
        let protocol = document.location.protocol || '';
        let hostname = document.location.hostname || 'localhost';
        let port = document.location.port ? ':' + document.location.port : '';

        this.URL = protocol + '//' + hostname + port + (url || '');
      }
    }
  }

  /**
   * Set the stored data for this session
   * @param session an object to serialize and store
   */
  public setSession(session: any): void {
    if (typeof localStorage === 'undefined') return;

    if (session === null) {
      localStorage.removeItem(this.sessionName);
    } else {
      localStorage.setItem(this.sessionName, JSON.stringify(session));
    }
  }

  /**
   * Get the currently stored session data
   */
  public getSession(): any {
    if (typeof localStorage === 'undefined') return null;

    var session = localStorage.getItem(this.sessionName);
    if (session) {
      return JSON.parse(session);
    }

    return null;
  }

  /**
   * Set the authorization token
   * @param token a signed JWT token
   */
  public setSessionToken(token: string) {
    const session = this.getSession() || {};
    session.token = token;
    this.setSession(session);
  }

  /**
   * Get the current authorization token
   */
  public getSessionToken(): string {
    return this.getSession() ? this.getSession().token : null;
  }

  /**
   * Make a HTTP request
   * @param method HTTP method
   * @param path the path to request
   * @param options attach a payload, etc
   */
  private request(method: string, path: string, options: FetchOptions = {}): Promise<any> {
    const url = path.indexOf('http') > -1 ? path : this.URL + path;

    options = merge({ method: method }, options);

    // Set up basic headers
    options.headers = merge(
      {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      options.headers
    );

    // Only attach auth if we are signed in
    if (this.getSessionToken()) {
      options.headers.authorization = this.getSessionToken();
    }

    // Attach the payload
    if (options.payload) {
      options.body = JSON.stringify(options.payload);
    }

    let status = 200;

    return fetch(url, options)
      .then((r: any) => {
        status = r.status;
        return r.json();
      })
      .then((response: any) => {
        if (response == null) return Promise.resolve(response);

        if (response.message && response.message == 'Invalid session') {
          this.setSession(null);
          document && document.location.reload();
        }

        if (response.message && response.message == 'Invalid token format') {
          this.setSession(null);
        }

        status = response.status || status;
        if (status < 200 || status >= 400) {
          var error = new APIError(response.message ? response.message : response.error);
          error.status = status;
          if (response.data) {
            error.data = response.data;
          }
          return Promise.reject(error);
        }

        return Promise.resolve(response);
      });
  }

  /**
   * Make a HTTP GET request
   * @param path the path to get
   * @param options
   */
  public get(path: string, options: FetchOptions = {}): Promise<any> {
    return this.request('get', path, options);
  }

  /**
   * Make a HTTP POST request
   * @param path the path to post to
   * @param payload the body to send
   * @param options
   */
  public post(path: string, payload: any = {}, options: FetchOptions = {}): Promise<any> {
    options = merge({ payload }, options);
    return this.request('post', path, options);
  }

  /**
   * Make a HTTP PUT request
   * @param path the path to put to
   * @param payload the body to send
   * @param options
   */
  public put(path: string, payload: any = {}, options: FetchOptions = {}): Promise<any> {
    options = merge({ payload }, options);
    return this.request('put', path, options);
  }

  /**
   * Make a HTTP DELETE request
   * @param path The path to delete to
   * @param options
   */
  public delete(path: string, options: FetchOptions = {}): Promise<any> {
    return this.request('delete', path, options);
  }
}
