<template>
    <div id="code" ng-class="{ 'minimize-code': $ctrl.$storage.minimize }">
        <div class="code-button">
            <span ng-click="$ctrl.toggle()" class="pull-left">
                <icon class="fa" ng-class="{ 'fa-caret-left': $ctrl.$storage.minimize, 'fa-caret-right': !$ctrl.$storage.minimize }"></icon>
            </span>
            <span ng-click="$ctrl.minus()"><icon fa="minus" ng-hide=" $ctrl.$storage.minimize">
                </icon>
            </span>
            <span ng-click="$ctrl.plus()"><icon fa="plus" ng-hide=" $ctrl.$storage.minimize">
                </icon>
            </span>
        </div>
        <!--<pre style="font-size: {{ $ctrl.font }}em" ng-transclude></pre>-->
        <div class="pre" style="font-size: {{ $ctrl.$storage.codeFont }}em">
            <json-formatter json="$ctrl.value" open="1" class="json-formatter-dark"></json-formatter>
        </div>
    </div>
</template>

<script>
    export default {
        transclude: true,
        bindings: { value: '=' },
        controller: ['$localStorage', function ($localStorage) {

            this.minimize = false;

            this.$storage = $localStorage.$default({
                codeFont: 0.90,
                minimize: false
            });

            this.minus = f => { 
                this.$storage.codeFont -= this.$storage.codeFont * 0.10 
            }

            this.plus = f => { 
                this.$storage.codeFont += this.$storage.codeFont * 0.10 
            }

            this.toggle = () => {
                this.$storage.minimize = !this.$storage.minimize;
            }
        }]
    }
</script>

<style>

    @import '~jsonformatter/dist/json-formatter.css';

    .json-formatter-dark.json-formatter-row .json-formatter-row {
        margin-left: 2em;
    }

    .json-formatter-dark.json-formatter-row .json-formatter-row:hover {
        background: rgba(2, 2, 2, 0.21);
    }

    #code .pre {
        margin: 0;
        padding: 30px 10px;
        display: block;
        background: #1d1f20;
        color: #839496;
        font-size: .85em;
        line-height: 1.6em;
        text-align: left;
        overflow: scroll;
        height: 600px;
    }

    #code {
        position: fixed;
        top: 56px;
        right: 3px;
        width: 441px;
        float: right;
        display: block;
        z-index: 999999;
        margin: 0;
        opacity: 0.7;
    }

    #code:hover {
        opacity: 1;
    }

    .code-button {
        display: block;
        position: absolute;
        padding: 5px 10px;
        width: 100%;
        padding: 5px 30px 5px 5px;
    }

    .code-button span {
        padding: 5px;
        cursor: pointer;
        position: relative;
        float: right;
    }

    .minimize-code {
        width: 40px !important;
        height: 40px !important;
    }
</style>
