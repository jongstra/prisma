TODO:
- Meerdere Pinia stores aanmaken voor verscheidene domeinen.

- DETT&CT data sources json file inlezen.
  - Domein inlezen uit file. Op basis daarvan de bijbehorende tactics/techniques inladen.
  - Techniques per tactic/unified kill chain phase tonen in front-end.
    - json file vinden/maken obv unified killchain waar alle technieken onder de phases staan.
  - Alleen de techniques met een value anders dan "-" bij 'Available data sources' highlighten in front-end.

- filteren ook obv platform/score.

- Buttons met techniques (en hun tooltips) mooier maken. Bootstrap gebruiken?
- Filtering van techniques inbouwen.


Notes:
- "backend": "cd ../backend && FLASK_APP=app.py flask run",