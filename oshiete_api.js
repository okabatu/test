var OshieteApi;

(function($) {
  var uuid = localStorage.getItem('uuid');
  var config = {
    defaultHost : 'stg.ms10.oshiete.goo.ne.jp',
//	change for #4
    defaultClientId : 'lod04.api.oshiete.goo.ne.jp',
    defaultClientSecret : 'sz3wgrmPmzuzrlViqjlbwspjx2czppim',

    host : localStorage.getItem('host'),
    clientId : localStorage.getItem('client_id'),
    clientSecret : localStorage.getItem('client_secret'),
    errorCodeForRetry : '3',
  };

  if (!uuid) {
    uuid = '';
  };

  if (!config.host) {
    config.host = config.defaultHost;
    config.clientId = config.defaultClientId;
    config.clientSecret = config.defaultClientSecret;
  };

  var clientName = config.clientId.split('.api.oshiete.goo.ne.jp')[0];
  config.url = 'https://' + config.host + '/api/v1/' + clientName + '/';

  OshieteApi = {
    uuid: uuid,
    accessToken: null,
    useTokenType: localStorage.getItem('useTokenType'),
    config: config,

    /**
     * QAコネクトを実行する。
     * トークン不正で失敗した場合はトークン取得APIを実行し、
     * その他のエラーの場合はポップアップを表示する。
     *
     * @param {string} type HTTPリクエストメソッド名
     * @param {string} path URLパス名
     * @param {object} data リクエストパラメータ
     * @param {function} callback コールバック関数
     * @return {object} ajaxオブジェクト
     */
    callApi: function(type, path, data, callback) {
      var ajax = $.ajax({
        type : type,
        url : config.url + path,
        headers : { 'X-Access-Token' : OshieteApi.accessToken },
        data : data,
      });

      ajax.done(function(response) {
        callback(response);
      });

      ajax.fail(function(response) {
        var errorInfo = JSON.parse(response.responseText);

        if (errorInfo.code != config.errorCodeForRetry) {
          window.alert(errorInfo.message);
        } else {
          $.when(OshieteApi.getAccessToken()).then(function () {
            OshieteApi.callApi(type, path, data, callback);
          });
        };
      });

      return ajax;
    },

    /**
     * アクセストークンを取得する。
     *
     * @return {object} ajaxオブジェクト
     */
    getAccessToken: function () {
      var path = 'auth/access_token/create';
      var data = {
        client_id : config.clientId,
        client_secret : config.clientSecret,
      };

      if (!OshieteApi.useTokenType
          || OshieteApi.useTokenType == 'uuid') {
        data.uuid = OshieteApi.uuid;
      };

      var callback = function (response) {
        OshieteApi.accessToken = response.access_token;
      };

      return this.callApi('POST', path, data, callback);
    },
  };
})(jQuery);
