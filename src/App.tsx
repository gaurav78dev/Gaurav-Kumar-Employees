import React, { useState } from "react";
import "./App.css";
import Papa, { ParseResult } from "papaparse";

interface Task {
  employeeA: string;
  employeeB: string;
  sum: number;
  details: Array<Details>;
}

interface Details {
  days: number;
  proj: number;
}

interface TastDateDetails {
  empID: string;
  enDate: Date;
  stDate: Date;
}

interface CombinationEmp {
  [key: string]: Task;
}

interface Test1 {
  [key: string]: Array<TastDateDetails>;
}

const oneDay = 24 * 60 * 60 * 1000;
const setDate = (value: string) => {
  if (value?.includes("/")) {
    let [year, month, day] = value.split("/").map(Number);
    return new Date(year, --month, day);
  } else {
    let [year, month, day] = value.split("-").map(Number);
    return new Date(year, --month, day);
  }
};

function App() {
  const [employWorkCal, setEmployeWorkedCal] = useState<Task[]>([]);

  /**
   * handle csv change handler
   * @param event
   */
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        complete: function (results: ParseResult<Array<string>>) {
          results.data.forEach((element: Array<string>) => {
            if (element[3] === "") {
              const d = new Date();
              var dateString = new Date(
                d.getTime() - d.getTimezoneOffset() * 60000
              )
                .toISOString()
                .split("T")[0];
              element[3] = dateString;
            }
          });
          const Proj_Emps = results.data.reduce(
            (
              result: Test1,
              [EmpID, ProjectID, DateForm, DateTo]: Array<string>
            ) => {
              if (DateForm !== undefined) {
                let stDate = setDate(DateForm),
                  enDate = DateTo ? setDate(DateTo) : new Date();
                result[ProjectID] = result[ProjectID] ?? [];
                let empID = EmpID;
                result[ProjectID].push({ empID, stDate, enDate });
                console.log({ result });
              }
              return result;
            },
            {}
          );
          let combination: CombinationEmp = {};
          for (let proj in Proj_Emps) {
            for (let i = 0; i < Proj_Emps[proj].length - 1; i++)
              for (let j = i + 1; j < Proj_Emps[proj].length; j++) {
                let employeeA = Proj_Emps[proj][i];
                let employeeB = Proj_Emps[proj][j];
                if (
                  (employeeA.enDate <= employeeB.enDate &&
                    employeeA.enDate > employeeB.stDate) ||
                  (employeeB.enDate <= employeeA.enDate &&
                    employeeB.enDate > employeeA.stDate)
                ) {
                  let D1 =
                      employeeA.stDate > employeeB.stDate
                        ? employeeA.stDate
                        : employeeB.stDate,
                    D2 =
                      employeeA.enDate < employeeB.enDate
                        ? employeeA.enDate
                        : employeeB.enDate,
                    days = Math.ceil((D2.getTime() - D1.getTime()) / oneDay),
                    key = `${employeeA.empID}-${employeeB.empID}`;
                  combination[key] = combination[key] ?? {
                    employeeA: employeeA.empID,
                    employeeB: employeeB.empID,
                    sum: 0,
                    details: [],
                  };
                  combination[key].details.push({ proj: Number(proj), days });
                  combination[key].sum += days;
                }
              }
          }

          let Result = Object.entries(combination)
            .sort((a: any, b: any) => {
              return b[1].sum - a[1].sum;
            })
            .map(([k, v]) => v);
          setEmployeWorkedCal(Result);
        },
      });
    }
  };
  return (
    <div className="App">
      <div className="upload-file-section">
        <div>
          <input
            className="form-control"
            type="file"
            name="file"
            accept=".csv"
            onChange={changeHandler}
          />
        </div>
        <table>
          <thead hidden={employWorkCal.length === 0}>
            <tr>
              <th>Employee 1</th>
              <th>Employee 2</th>
              <th>Project Id</th>
              <th>Work Days</th>
            </tr>
          </thead>
          <tbody>
            {employWorkCal.length > 0 &&
              employWorkCal.map((item: Task) =>
                item.details.map((x: Details) => {
                  return (
                    <>
                      <tr>
                        <td>{item.employeeA}</td>
                        <td>{item.employeeB}</td>
                        <td>{x.proj} </td>
                        <td>{x.days}</td>
                      </tr>
                    </>
                  );
                })
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
