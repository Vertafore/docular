<?php

    class Controller {

        private $req;
        private $res;
        private $api;
        private $configs;

        public function getResponse () {

            $reposDefaults = array(
                "client_id" => $this->configs["client_id"],
                "client_secret" => $this->configs["client_secret"]
            );

            // /repos/:owner/:repo/contributors
            $CTRL_REPO_CONTRIBUTOR = "/\/([^\/]{1,})\/([^\/]{1,})\/contributors/";
            // /repos/:owner/:repo/issues
            $CTRL_REPO_ISSUES = "/\/([^\/]{1,})\/([^\/]{1,})\/issues/";

            preg_match($CTRL_REPO_CONTRIBUTOR, $this->req->uri, $ctrlParams);
            preg_match($CTRL_REPO_ISSUES, $this->req->uri, $ctrlIssues);

            if($ctrlParams){

                $params = array(
                    "owner" => $ctrlParams[1],
                    "repo" => $ctrlParams[2]
                );

                $final_configs = array_merge_recursive($reposDefaults, $params);

                //request url
                $request_path = 'https://api.github.com'.
                    '/repos/'.$final_configs['owner'].'/'.$final_configs['repo'].'/contributors'.
                    '?client_id='.$final_configs['client_id'].'&client_secret='.$final_configs['client_secret'];

                $request_uri = $this->api->addQueryParams($request_path, $this->req->query);

                $headers = array('User-Agent' => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
                $response = $this->api->request($request_uri, $headers);

                return $response;

            } else if ($ctrlIssues) {

                $params = array(
                    "owner" => $ctrlIssues[1],
                    "repo" => $ctrlIssues[2]
                );

                $final_configs = array_merge_recursive($reposDefaults, $params);

                //request url
                $request_path = 'https://api.github.com'.
                    '/repos/'.$final_configs['owner'].'/'.$final_configs['repo'].'/issues'.
                    '?client_id='.$final_configs['client_id'].'&client_secret='.$final_configs['client_secret'];

                $request_uri = $this->api->addQueryParams($request_path, $this->req->query);

                $headers = array('User-Agent' => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
                $response = $this->api->request($request_uri, $headers);

                return $response;
            }

            return "{error:true}";
        }

        public function __construct ($req, $res, $api, $configs) {
            $this->req = $req;
            $this->res = $res;
            $this->api = $api;
            $this->configs = $configs;
        }

    }

?>