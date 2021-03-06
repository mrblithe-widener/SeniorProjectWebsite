import React from "react";
import {connect} from "react-redux";
import {actionCreators} from "../store/School";
import { bindActionCreators } from "redux";
import SchoolSearchBar from "./SchoolSearchBar";
import LoadingDisplay from "./LoadingDisplay";
import ErrorDisplay from "./ErrorDisplay";
import { errorActionCreators } from "../store/Error";
import { MathCols, RenderRowContent, ReadCols, emptyFilter, GeoCols, TeacherRatioCols,
Title1Cols, BusinessCols, IncomeCols, FundingCols } from "../utils/ColumnRecord";
import {Table, Input} from "reactstrap";
import ColDisplay from "./ColDisplay";

class SchoolDisplay extends React.Component{

    constructor(props){
        super(props);
        this.state = { hasRequestedOthers: false, active: "" };
        this.ColDisplays = [
            new ColDisplayMetaData("Geo", "Geo", GeoCols, "Geographical Information",""),
            new ColDisplayMetaData("Title1","Title1", Title1Cols, "Title 1",""),
            new ColDisplayMetaData("Local Business Information", "Business", BusinessCols,"Local Business Information",""),
            new ColDisplayMetaData("Local Income Tax Information", "Income", IncomeCols, "Local Income Tax Information","The money amounts are reported in thousands of dollars."),
            new ColDisplayMetaData("School Funding Information", "Funding", FundingCols, "School Funding Information", " All amounts, except for fall membership and personal income, are expressed in thousands of dollars. Fall membership data are presented in whole amounts. Personal income totals are expressed in millions of dollars.")
        ];
    }

    componentWillUnmount(){
        this.props.error.clearError();
		this.props.school.clearAll();
    }
    

    componentDidMount(){
        if(this.props.match.params.ncesschid){
            this.setState({hasRequestedIndex:true});
            this.props.school.requestIndex(this.props.match.params.ncesschid);
        }
    }

    componentWillReceiveProps(newProps){
        if(newProps.Index && !this.props.Index){
            this.setState({hasRequestedOthers:true});
            this.props.school.requestMath(newProps.Index.nceesch);
            this.props.school.requestRead(newProps.Index.nceesch);
            if(newProps.Index.zip && newProps.Index.zip !== ''){
                this.props.school.requestBusiness(newProps.Index.zip);
                this.props.school.requestIncome(newProps.Index.zip);
            }
            this.props.school.requestFunding(newProps.Index.leaid);
            this.props.school.requestGeo(newProps.Index.nceesch);
            this.props.school.requestTeacherRatios(newProps.Index.nceesch);
            this.props.school.requestTitle1(newProps.Index.nceesch);
        }
    }


    renderDisplay() {
        return <div> {this.ColDisplays.map(x => <ColDisplay key={x.name} show={this.state.active === x.name} Cols={x.Cols} dataset={this.props[x.dataset]} Name={x.FriendlyName} Message={x.Message} />)}</div>
    }

    handleColDisplayChange(e) {
        const newVal = e.currentTarget.value;
        this.setState({ active: newVal });
    }   

    renderColSelector() {
        return (<div>
            <Input type="select" onChange={this.handleColDisplayChange.bind(this)} value={this.state.active} >
                <option value={""}> </option>
                {this.ColDisplays.map(x => this.props[x.dataset] ? <option key={x.name} value={x.name}>{x.FriendlyName} </option> : null )}
            </Input>
        </div>);
    }
    getNameInfo(){
        let name = null;

        if(this.props.Math_Scores)
            name = name || this.props.Math_Scores.mathSchnam;
        if(this.props.Read_Scores)
            name = name || this.props.Read_Scores.readSchnam;
        if(this.props.Geo)
            name = name || this.props.Geo.name;
        let district = null;

        if(this.props.Math_Scores)
            district = district || this.props.Math_Scores.mathLeanm;
        if(this.props.Read_Scores)
            district = district || this.props.Read_Scores.readLeanm;
        if(this.props.Geo)
            district = district || this.props.Geo.leanm
        if(name && !district)
            return name
        if(name && district)
            return name+", "+district;
        return "";
    }
    render(){
        return (<div>
			<ErrorDisplay />
            <LoadingDisplay />
            {this.props.Math_Scores || this.props.Read_Scores || this.props.Geo ?<h4>{this.getNameInfo()}</h4>:null}
            {this.props.Geo?<h5>{this.props.Geo.street+", "+this.props.Geo.city+", "+this.props.Geo.state+", "+this.props.Geo.zip}</h5>:null}
            <Table borderless={true} style={{ width: "75%" }}> 
                <tbody>
				    <tr>
					    {this.props.Math_Scores? readMathRender(this.props.Math_Scores, MathCols):null}
					    {this.props.Math_Scores && this.props.TeacherRatios? 
                            [<td key={1} data-toggle="tooltip" data-placement="bottom" title={MathCols[2].Column_Description}>
							    {MathCols[2].Column_Friendly_Name}
						    </td>,
                            <td key={2}>
							    {emptyFilter(MathCols[2].handler(this.props.Math_Scores['mathAllGradesNumvalid'], this.props.TeacherRatios.numFullTime))}
						    </td>]:null}</tr>
						    <tr>
					    {this.props.Read_Scores? readMathRender(this.props.Read_Scores, ReadCols):null}
					    {this.props.Read_Scores && this.props.TeacherRatios? 
                            [<td key={1} data-toggle="tooltip" data-placement="bottom" title={ReadCols[2].Column_Description}>
							    {ReadCols[2].Column_Friendly_Name}
						    </td>,
                            <td key={2}key={1} data-toggle="tooltip" data-placement="bottom" title={ReadCols[2].Column_Description}>
							    {emptyFilter(ReadCols[2].handler(this.props.Read_Scores['readAllGradesNumvalid'], this.props.TeacherRatios.numFullTime))}
						    </td>]:null}
                    </tr>
                    {this.props.TeacherRatios ? RenderRowContent(TeacherRatioCols[0], this.props.TeacherRatios) : null}
                </tbody>
            </Table>
            {this.renderColSelector()}
            {this.renderDisplay()}
             </div>);
    }
}

class ColDisplayMetaData{
    constructor(name, dataset, Cols, FriendlyName, Message){
        this.name = name;
        this.dataset = dataset;
        this.Cols = Cols;
        this.FriendlyName = FriendlyName;
        this.Message = Message;
    }
}

function readMathRender(dataset, cols){
    return [
        <td key={11} data-toggle="tooltip" data-placement="bottom" title={cols[0].Column_Description}>
            {cols[0].Column_Friendly_Name}
        </td>,
        <td key={12} data-toggle="tooltip" data-placement="bottom" title={cols[0].Column_Description}>
            {emptyFilter(cols[0].handler(dataset, cols[0].Column_Name))}
        </td> ,
        <td key={21} data-toggle="tooltip" data-placement="bottom" title={cols[1].Column_Description}>
            {cols[1].Column_Friendly_Name}
        </td>,
        <td key={22}data-toggle="tooltip" data-placement="bottom" title={cols[1].Column_Description}>
            {emptyFilter(cols[1].handler(dataset, cols[1].Column_Name))}
        </td>
		];
}

export default connect((state) => {return {
        Math_Scores:state.school.Math_Scores, 
        Read_Scores:state.school.Read_Scores,
        Business:state.school.Business,
        Funding:state.school.Funding,
        Geo:state.school.Geo,
        Income:state.school.Income,
        Index:state.school.Index,
        TeacherRatios:state.school.TeacherRatios,
        Title1:state.school.Title1

}}, (dispatch)=>{
    return {school:bindActionCreators(actionCreators, dispatch),
        error:bindActionCreators(errorActionCreators, dispatch)}
    })(SchoolDisplay);
